import { fireEvent, screen, waitFor } from "../../test-utils";
import { renderWithProviders } from "../../test-utils";

import { TasksPage } from "./TasksPage";

vi.mock("./taskApi", () => {
  const mutateAsync = vi.fn();
  return {
    useTasks: vi.fn(() => ({ data: { results: [], count: 0 }, isLoading: false })),
    useCreateTask: vi.fn(() => ({ mutateAsync })),
    useUpdateTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
    useDeleteTask: vi.fn(() => ({ mutateAsync: vi.fn() })),
    __esModule: true,
  };
});

describe("TasksPage", () => {
  it("creates a new task", async () => {
    const { useCreateTask } = await import("./taskApi");
    const createMock = useCreateTask() as { mutateAsync: ReturnType<typeof vi.fn> };
    createMock.mutateAsync.mockResolvedValue(undefined);

    renderWithProviders(<TasksPage />, {
      authOverride: { isAuthenticated: true },
    });

    fireEvent.change(screen.getByLabelText(/title/i), { target: { value: "New Task" } });
    fireEvent.click(screen.getByRole("button", { name: /add task/i }));

    await waitFor(() =>
      expect(createMock.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ title: "New Task" }),
      ),
    );
  });
});
