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

/**
 * Invalidar caché de un usuario (eliminar todos sus items de caché)
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

    // Eliminar cada item
    if (result.Items) {
      for (const item of result.Items) {
        const unmarshalled = unmarshall(item) as CacheItem;
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

