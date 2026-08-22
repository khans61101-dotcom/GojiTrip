import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: any) {
    const identifier = body.email ?? body.username;
    const user = await this.authService.validateUser(identifier, body.password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() body: any) {
    return this.authService.register(body);
  }
}
