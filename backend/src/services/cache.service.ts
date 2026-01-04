import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  DeleteItemCommand,
} from '@aws-sdk/client-dynamodb';
import dynamoDBClient, { dynamoDBConfig } from '../config/dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const TABLE_NAME = dynamoDBConfig.DYNAMODB_TABLE_NAME;
const CACHE_TTL_MINUTES = 5; // TTL de 5 minutos

// Calcular TTL (timestamp Unix en segundos)
const getTTL = () => {
  return Math.floor(Date.now() / 1000) + (CACHE_TTL_MINUTES * 60);
};

export interface CacheItem {
  userId: string;
  debtId: string;
  totalPending: number;
  totalPaid: number;
  lastUpdated: string;
  ttl: number;
}

export interface CacheList {
  userId: string;
  debtId: string; // Para listados usamos "list-{status}"
  data: string; // JSON serializado de las deudas
  lastUpdated: string;
  ttl: number;
}

/**
 * Invalidar caché de un usuario (eliminar todos sus items de caché)
 * Esto incluye tanto los items individuales como los listados
 */
export const invalidateUserCache = async (userId: string): Promise<void> => {
  try {
    // Buscar todos los items del usuario
    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: marshall({
        ':userId': userId,
      }),
    });

    const result = await dynamoDBClient.send(queryCommand);

    // Eliminar cada item (incluye listados y items individuales)
    if (result.Items) {
      for (const item of result.Items) {
        const unmarshalled = unmarshall(item) as CacheItem | CacheList;
        const deleteCommand = new DeleteItemCommand({
          TableName: TABLE_NAME,
          Key: marshall({
            userId: unmarshalled.userId,
            debtId: unmarshalled.debtId,
          }),
        });
        await dynamoDBClient.send(deleteCommand);
      }
    }
  } catch (error) {
    // Si hay error, simplemente loguear pero no fallar
    // El caché es opcional, la aplicación debe funcionar sin él
    console.error('Error invalidating cache:', error);
  }
};

/**
 * Obtener datos de caché para un usuario
 */
export const getCachedDebts = async (
  userId: string,
  status: 'pending' | 'paid' | 'all' = 'all'
): Promise<CacheItem[] | null> => {
  try {
    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: marshall({
        ':userId': userId,
      }),
    });

    const result = await dynamoDBClient.send(queryCommand);

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const items = result.Items.map((item) => unmarshall(item) as CacheItem);
    
    // Filtrar por status si es necesario
    if (status !== 'all') {
      // Por ahora retornamos todos, el filtrado se hace en el servicio
      return items;
    }

    return items;
  } catch (error) {
    console.error('Error getting cached debts:', error);
    return null;
  }
};

/**
 * Guardar datos en caché
 */
export const setCachedDebt = async (
  userId: string,
  debtId: string,
  totalPending: number,
  totalPaid: number
): Promise<void> => {
  try {
    const item: CacheItem = {
      userId,
      debtId,
      totalPending,
      totalPaid,
      lastUpdated: new Date().toISOString(),
      ttl: getTTL(),
    };

    const putCommand = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item),
    });

    await dynamoDBClient.send(putCommand);
  } catch (error) {
    // Si hay error, simplemente loguear pero no fallar
    console.error('Error setting cache:', error);
  }
};

/**
 * Obtener listado completo de deudas desde caché
 */
export const getCachedDebtsList = async (
  userId: string,
  status: 'pending' | 'paid' | 'all' = 'all'
): Promise<any[] | null> => {
  try {
    const cacheKey = `list-${status}`;
    const getCommand = new GetItemCommand({
      TableName: TABLE_NAME,
      Key: marshall({
        userId,
        debtId: cacheKey,
      }),
    });

    const result = await dynamoDBClient.send(getCommand);

    if (!result.Item) {
      return null;
    }

    const item = unmarshall(result.Item) as CacheList;
    return JSON.parse(item.data);
  } catch (error) {
    console.error('Error getting cached debts list:', error);
    return null;
  }
};

/**
 * Guardar listado completo de deudas en caché
 */
export const setCachedDebtsList = async (
  userId: string,
  status: 'pending' | 'paid' | 'all',
  debts: any[]
): Promise<void> => {
  try {
    const cacheKey = `list-${status}`;
    const item: CacheList = {
      userId,
      debtId: cacheKey,
      data: JSON.stringify(debts),
      lastUpdated: new Date().toISOString(),
      ttl: getTTL(),
    };

    const putCommand = new PutItemCommand({
      TableName: TABLE_NAME,
      Item: marshall(item),
    });

    await dynamoDBClient.send(putCommand);
  } catch (error) {
    console.error('Error setting cached debts list:', error);
  }
};

