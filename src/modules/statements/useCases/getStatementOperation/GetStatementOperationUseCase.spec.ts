import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";


let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to show a statement operation by user id", async () => {
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
      user_id: userCreated.id as string
    };
    const statementDepositCreated = await inMemoryStatementsRepository.create(deposit);
    const response = await getStatementOperationUseCase.execute({
      user_id: userCreated.id as string,
      statement_id: statementDepositCreated.id as string
    })
    expect(response).toHaveProperty("id")
    expect(response).toHaveProperty("type")
  });

  it("should not be able to show a statement operation with nonexistent user", () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({ user_id: "1234", statement_id: "123456" })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to show a statement operation with nonexistent statement", () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: "Maria Silva",
        email: "marialsilva@email.com",
        password: "xcvbnm"
      };
      const userCreated = await inMemoryUsersRepository.create(user);
      await getStatementOperationUseCase.execute({ user_id: userCreated.id as string, statement_id: "123456" })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});