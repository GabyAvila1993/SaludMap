import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserService } from '../users/user.service';

export class AuthService {
  private userService: UserService;
  private readonly jwtSecret = process.env.JWT_SECRET || 'tu-secreto';

  constructor() {
    this.userService = new UserService();
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(email: string, password: string, name: string): Promise<any> {
    const hashedPassword = await bcrypt.hash(password, 12);
    return await this.userService.createUser(email, hashedPassword, name);
  }

  login(user: any): string {
    const payload = { email: user.email, sub: user.id };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  verifyToken(token: string): any {
    return jwt.verify(token, this.jwtSecret);
  }
}