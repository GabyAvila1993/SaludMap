import { User, IUser } from './user.model';

export class UserService {
  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async createUser(email: string, password: string, name: string): Promise<IUser> {
    const user = new User({ email, password, name });
    return await user.save();
  }
}