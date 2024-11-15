import pb from '@/lib/pocketbase';

interface ConnectedService {
  id: string;
  name: string;
  connected: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number | null;
}

const updateConnectedServices = async (
  userId: string,
  newService: ConnectedService
) => {
  try {
    // Get the current user record
    const user = await pb.collection('users').getOne(userId);

    // Get existing services or initialize empty array
    let services: ConnectedService[] = user.connectedServices || [];

    // Find existing service
    const existingServiceIndex = services.findIndex(
      (service) => service.id === newService.id
    );

    if (existingServiceIndex !== -1) {
      // Update existing service while preserving any existing fields
      services[existingServiceIndex] = {
        ...services[existingServiceIndex],
        ...newService,
        connected: true, // Ensure connected is set to true
      };
    } else {
      // Add new service
      services.push({
        ...newService,
        connected: true, // Ensure connected is set to true
      });
    }

    // Update the user record
    const result = await pb.collection('users').update(userId, {
      connectedServices: services,
    });

    console.log('Connected services updated:', result.connectedServices);
    return result;
  } catch (error) {
    console.error('Failed to update connected services:', error);
    throw error;
  }
};

export default updateConnectedServices;
