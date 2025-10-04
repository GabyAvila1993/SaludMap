import { Request, Response } from 'express';
import { AuthService } from './auth.service';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.validateUser(email, password);
      
      if (!result) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = this.authService.login(result);
      res.json({ token, user: result });
    } catch (error) {
      res.status(500).json({ message: 'Error en el servidor' });
    }
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;
      const user = await this.authService.register(email, password, name);
      const token = this.authService.login(user);
      
      res.status(201).json({ token, user });
    } catch (error) {
      res.status(400).json({ message: 'Error al registrar usuario' });
    }
  }
}