export class Failure {
  message: string;

  constructor(message: string = "An unexpected error occurred") {
    this.message = message;
  }
}