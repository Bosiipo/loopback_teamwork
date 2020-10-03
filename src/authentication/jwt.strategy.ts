import {AuthenticationStrategy} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {ParamsDictionary} from 'express-serve-static-core';
import {ParsedQs} from 'qs';
import {JWTService} from '../services/jwt.service';
import {TokenServiceBindings} from './keys';
// import { Request } from "@loopback/rest";

export class JWTStrategy implements AuthenticationStrategy {
  name = 'jwt';
  @inject(TokenServiceBindings.TOKEN_SERVICE)
  public jwtService: JWTService;
  // @inject(RestBindings.Http.REQUEST) public req,

  // async authenticate(
  //   request: Request<ParamsDictionary, any, any, ParsedQs>,
  // ): Promise<UserProfile | RedirectRoute | undefined> {
  //   const token: string = this.extractCredentials(request);
  //   const userProfile = await this.jwtService.verifyToken(token);
  //   console.log(userProfile);
  //   // request.userData = userProfile;
  //   return Promise.resolve(userProfile);
  // }
  async authenticate(request: Request): Promise<UserProfile | undefined> {
    const token: string = this.extractCredentials(request);
    try {
      const user: UserProfile = await this.jwtService.verifyToken(token);
      // console.log(user);
      return user;
    } catch (err) {
      Object.assign(err, {code: 'INVALID_ACCESS_TOKEN', statusCode: 401});
      throw err;
    }
  }

  extractCredentials(
    request: Request<ParamsDictionary, any, any, ParsedQs>,
  ): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized('Authorization is missing');
    }
    const authHeaderValue = request.headers.authorization;

    // authorization : Bearer xxxx.yyyy.zzzz
    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(
        'Authorization header is not type of Bearer',
      );
    }
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2) {
      throw new HttpErrors.Unauthorized(
        `Authorization header has too many part is must follow this patter 'Bearer xx.yy.zz`,
      );
    }
    const token = parts[1];
    return token;
  }
}
