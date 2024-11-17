import { env } from '@xenova/transformers';

// Configure environment for local model loading
env.localModelPath = '/models';
env.allowLocalModels = true;
env.useLocalModel = true;

// Initialize the model
let modelPromise: Promise<any> | null = null;

// Simple text encoder that converts text to numerical embeddings
class SimpleEmbeddingModel {
  async __call__(text: string) {
    try {
      // Convert text to a fixed-size embedding
      const chars = text.toLowerCase().split('');
      const embedding = new Float32Array(384); // Same size as MiniLM-L6-v2
      
      // Fill the embedding array with character codes
      for (let i = 0; i < chars.length && i < embedding.length; i++) {
        embedding[i] = chars[i].charCodeAt(0) / 255;
      }
      
      // Normalize the embedding
      const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      for (let i = 0; i < embedding.length; i++) {
        embedding[i] = embedding[i] / (norm || 1);
      }

      return {
        data: embedding
      };
    } catch (error) {
      console.error('Error in model inference:', error);
      throw error;
    }
  }
}

export const getEmbeddingModel = async () => {
  if (!modelPromise) {
    try {
      console.log('Initializing embedding model...');
      modelPromise = Promise.resolve(new SimpleEmbeddingModel());
      console.log('Using simplified embedding model for testing');
    } catch (error) {
      console.error('Error creating model pipeline:', error);
      throw error;
    }
  }
  return modelPromise;
};
