export class AppException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AppException'
  }
}

export class BadRequestException extends AppException {
  constructor(message: string) {
    super(message)
    this.name = 'BadRequestException'
  }
}

export class ApiNotRespondingException extends AppException {
  constructor(message: string) {
    super(message)
    this.name = 'ApiNotRespondingException'
  }
}

export class UnauthorizedException extends AppException {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedException'
  }
}

export class TokenExpiredException extends AppException {
  constructor(message: string) {
    super(message)
    this.name = 'TokenExpiredException'
  }
}

export class MenuChangedException extends AppException {
  constructor(message: string) {
    super(message)
    this.name = 'MenuChangedException'
  }
}

export class UserDeletedException extends AppException {
  constructor(message: string) {
    super(message)
    this.name = 'UserDeletedException'
  }
}

