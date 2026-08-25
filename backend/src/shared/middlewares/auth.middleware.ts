import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_sobanhang';

// Mở rộng interface Request để chứa userId và role
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
        scope?: string;
        storeId?: string;
      };
    }
  }
}

export const verifySetupToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.setupToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Không tìm thấy token cài đặt (setupToken)' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.scope !== 'setup') {
      return res.status(403).json({ error: 'Token không hợp lệ cho tác vụ này' });
    }

    req.user = {
      userId: decoded.userId,
      scope: decoded.scope
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token cài đặt đã hết hạn hoặc không hợp lệ' });
  }
};

export const verifyAccessToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.accessToken;
  
  if (!token) {
    return res.status(401).json({ error: 'Chưa đăng nhập' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    if (decoded.scope !== 'access') {
      return res.status(403).json({ error: 'Token không hợp lệ' });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      scope: decoded.scope,
      storeId: decoded.storeId
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Phiên đăng nhập hết hạn' });
  }
};

export const verifyResetToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.resetToken;

  if (!token) {
    return res.status(401).json({ error: 'Vui lòng xác minh mã OTP trước' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Token đã hết hạn, vui lòng xin lại mã OTP' });
    }

    req.user = decoded;
    next();
  });
};
