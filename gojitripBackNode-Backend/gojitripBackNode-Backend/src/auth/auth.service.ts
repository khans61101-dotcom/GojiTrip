import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private safeUser(user: any) {
    const { password, ...result } = user;
    return result;
  }

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      return this.safeUser(user);
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      id: user.id,
      email: user.email,
      username: user.username,
      is_superuser: user.is_superuser,
    };
    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      user: this.safeUser(user),
    };
  }

  async register(registerDto: any) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          ...registerDto,
          password: hashedPassword,
        },
      });
      return this.safeUser(user);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException('Username or email already exists');
      }
      throw error;
    }
  }
}
