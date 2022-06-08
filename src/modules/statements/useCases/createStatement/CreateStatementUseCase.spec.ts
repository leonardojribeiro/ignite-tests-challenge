import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to create a new statement", async () => {
    const user: ICreateUserDTO = {
      name: "Maria Silva",
      email: "marialsilva@email.com",
      password: "xcvbnm"
    }
    const userCreated = await inMemoryUsersRepository.create(user)
    const deposit: ICreateStatementDTO = {
      type: OperationType.DEPOSIT,
      amount: 10000,
      description: "Freela",
      user_id: userCreated.id as string,
    }
    const statementDepositCreated = await createStatementUseCase.execute(deposit)
    const withdraw = {
      type: OperationType.WITHDRAW,
      amount: 500,
      description: "Energia",
      user_id: userCreated.id as string,
    }
    const statementWithdrawCreated = await createStatementUseCase.execute(withdraw)
    expect(statementDepositCreated).toHaveProperty("id")
    expect(statementWithdrawCreated).toHaveProperty("id")
  });

  it("should not be able to create a new statement with nonexistent user", () => {
    expect(async () => {
      const statement = {
        type: OperationType.DEPOSIT,
        amount: 10000,
        description: "Desenvolvimento de uma aplicação"
      }
      await createStatementUseCase.execute({
        user_id: "a0f02e5ceeee",
        type: statement.type,
        amount: statement.amount,
        description: statement.description
      })
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });
  
  it("should not be able to create a new statement with balance less than amount", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "Maria Silva",
        email: "marialsilva@email.com",
        password: "xcvbnm"
      }
      const userCreated = await inMemoryUsersRepository.create(user)
      const statement: ICreateStatementDTO = {
        type: OperationType.WITHDRAW,
        amount: 10000,
        description: "Freela",
        user_id: userCreated.id as string,
      }
      await createStatementUseCase.execute(statement)
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });
});