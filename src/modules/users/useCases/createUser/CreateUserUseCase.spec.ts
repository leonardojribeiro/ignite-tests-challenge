import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;


describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("should be able to create a new user", async () => {
    const user = {
      name: "Maria Silva",
      email: "marialsilva@email.com",
      password: "xcvbnm"
    }

    const userCreated = await createUserUseCase.execute({
      name: user.name,
      email: user.email,
      password: user.password
    });

    expect(userCreated).toHaveProperty("id")
  });

  it("should not be able to create a new user with email exists", () => {
    expect(async () => {

      const user = {
        name: "Jose da Silva",
        email: "josedasilva@email.com",
        password: "qwerty"
      }
      const user2 = {
        name: "Jose da Silva Pedrosa",
        email: "josedasilva@email.com",
        password: "asdfg"
      }

      await createUserUseCase.execute({
        name: user.name,
        email: user.email,
        password: user.password
      });

      await createUserUseCase.execute({
        name: user2.name,
        email: user2.email,
        password: user2.password
      });

    }).rejects.toBeInstanceOf(CreateUserError)
  });
});