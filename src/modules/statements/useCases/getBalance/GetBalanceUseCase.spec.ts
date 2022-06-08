import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";


let getBalanceUseCase: GetBalanceUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
  });

  it("should be able to show a balance by user id", async () => {
    const user: ICreateUserDTO = {
      name: "Maria Silva",
      email: "marialsilva@email.com",
      password: "xcvbnm"
    };
    const userCreated = await inMemoryUsersRepository.create(user);
    const deposit: ICreateStatementDTO = {
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Desenvolvimento de uma aplicação",
      user_id: userCreated.id as string,
    };
    await inMemoryStatementsRepository.create(deposit);
    const withdraw: ICreateStatementDTO = {
      user_id: userCreated.id as string,
      amount: 500,
      description: "Aluguel",
      type: OperationType.WITHDRAW,
    };
    await inMemoryStatementsRepository.create(withdraw);
    const response = await getBalanceUseCase.execute({ user_id: userCreated.id as string })
    expect(response.statement.length).toBe(2)
    expect(response.balance).toBe(9500)
  });
  
  it("should not be able to show a balance with nonexistent user", () => {
    expect(async () => {
      await getBalanceUseCase.execute({ user_id: "a0f5ee8a" })
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});