import React, { createContext, useContext, useState, ReactNode } from 'react';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import { 
  AppDocument, 
  PouchDBContextValue, 
  DBOperations,
  PouchDBInstance
} from '../types';

// Register the find plugin
PouchDB.plugin(PouchDBFind);

// Create the database instance
const db: PouchDBInstance = new PouchDB('app_database');

// Create context with a default value (will be overridden by provider)
const PouchDBContext = createContext<PouchDBContextValue | null>(null);

interface PouchDBProviderProps {
  children: ReactNode;
}

export function PouchDBProvider({ children }: PouchDBProviderProps): React.ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Database operations with TypeScript types
  const dbOperations: DBOperations = {
    // Get a document by ID
    async get<T extends AppDocument>(id: string): Promise<T> {
      try {
        return await db.get(id) as T;
      } catch (err) {
        console.error(`Failed to get document with ID ${id}`, err);
        throw err;
      }
    },

    // Find documents matching a selector
    async find<T extends AppDocument>(
      selector: PouchDB.Find.Selector,
      sort: Array<{ [propName: string]: 'asc' | 'desc' }> = [],
      useIndex?: string
    ): Promise<T[]> {
      try {
        setLoading(true);
        setError(null);

        const findOptions: PouchDB.Find.FindRequest<AppDocument> = {
          selector
        };

        if (sort && sort.length > 0) {
          findOptions.sort = sort;
        }

        if (useIndex) {
          findOptions.use_index = [`_design/${useIndex}`, useIndex] as [string, string];
        }

        const result = await db.find(findOptions);

        return result.docs as T[];
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to find documents', error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // Create a new document
    async create<T extends AppDocument>(
      doc: Omit<T, '_id' | '_rev'> & { _id?: string }
    ): Promise<T> {
      try {
        setLoading(true);
        setError(null);
        
        // Generate a composite ID with type prefix if not provided
        const docToCreate = { ...doc } as T;
        if (!docToCreate._id && docToCreate.type) {
          docToCreate._id = `${docToCreate.type}:${new Date().toISOString()}`;
        }
        
        const result = await db.put(docToCreate);
        return { ...docToCreate, _rev: result.rev } as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to create document', error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // Update an existing document
    async update<T extends AppDocument>(doc: T): Promise<T> {
      try {
        setLoading(true);
        setError(null);
        
        const result = await db.put(doc);
        return { ...doc, _rev: result.rev } as T;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to update document', error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // Delete a document
    async remove<T extends AppDocument>(doc: T): Promise<boolean> {
      try {
        setLoading(true);
        setError(null);
        
        if (!doc._rev) {
          throw new Error('Document revision is required for deletion');
        }
        await db.remove(doc._id, doc._rev);
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error('Failed to remove document', error);
        setError(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },

    // Subscribe to database changes
    subscribeToChanges(callback): () => void {
      // Set a higher max listeners limit at the start
      db.setMaxListeners(30);
      
      const changes = db.changes({
        since: 'now',
        live: true,
        include_docs: true,
        timeout: false,
        heartbeat: 1000 
      }) as PouchDB.Core.Changes<AppDocument>;

      // Add change listener
      changes.on('change', callback);
      
      // Return cleanup function
      return () => {
        changes.cancel(); // Cancel the changes feed
        changes.removeListener('change', callback); // Remove the specific listener
      };
    }
  };

  // Context value
  const value: PouchDBContextValue = {
    db,
    dbOperations,
    loading,
    error
  };

  return (
    <PouchDBContext.Provider value={value}>
      {children}
    </PouchDBContext.Provider>
  );
}

// Hook for using the PouchDB context
export function usePouchDB(): PouchDBContextValue {
  const context = useContext(PouchDBContext);
  if (context === null) {
    throw new Error('usePouchDB must be used within a PouchDBProvider');
  }
  return context;
}