import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('should return statistics from the service', async () => {
    const stats = {
      totals: { doctors: 3, patients: 3, appointments: 5 },
      appointmentsPerDoctor: [],
      upcomingAppointments: [],
    };
    const mockService = {
      getStats: jest.fn().mockResolvedValue(stats),
    } as unknown as AppService;

    const controller = new AppController(mockService);

    await expect(controller.getStats()).resolves.toEqual(stats);
    expect(mockService.getStats).toHaveBeenCalled();
  });
});
