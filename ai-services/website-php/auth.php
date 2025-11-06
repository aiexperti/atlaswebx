<?php
require_once 'config.php';
require_once 'jwt.php';

class Auth {
    private $pdo;
    
    public function __construct($pdo) {
        $this->pdo = $pdo;
    }
    
    /**
     * Sign up new user
     */
    public function signup($email, $password) {
        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['error' => 'Invalid email address'];
        }
        
        // Check if user exists
        $stmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            return ['error' => 'Email already exists'];
        }
        
        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        
        // Create user
        $stmt = $this->pdo->prepare("
            INSERT INTO users (email, password, plan, credits) 
            VALUES (?, ?, 'free', 10)
        ");
        $stmt->execute([$email, $hashedPassword]);
        $userId = $this->pdo->lastInsertId();
        
        // Generate JWT token
        $token = JWT::encode([
            'userId' => $userId,
            'email' => $email,
            'exp' => time() + JWT_EXPIRY
        ]);
        
        // Save session
        $this->saveSession($userId, $token);
        
        return [
            'success' => true,
            'user' => [
                'id' => $userId,
                'email' => $email,
                'plan' => 'free',
                'credits' => 10
            ],
            'token' => $token,
            'expiresIn' => JWT_EXPIRY * 1000
        ];
    }
    
    /**
     * Login user
     */
    public function login($email, $password) {
        // Get user
        $stmt = $this->pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return ['error' => 'Invalid credentials'];
        }
        
        // Verify password
        if (!password_verify($password, $user['password'])) {
            return ['error' => 'Invalid credentials'];
        }
        
        // Generate JWT token
        $token = JWT::encode([
            'userId' => $user['id'],
            'email' => $user['email'],
            'exp' => time() + JWT_EXPIRY
        ]);
        
        // Save session
        $this->saveSession($user['id'], $token);
        
        return [
            'success' => true,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'plan' => $user['plan'],
                'credits' => $user['credits']
            ],
            'token' => $token,
            'expiresIn' => JWT_EXPIRY * 1000
        ];
    }
    
    /**
     * Verify token
     */
    public function verify($token) {
        try {
            $payload = JWT::decode($token);
            
            // Check if token is expired
            if ($payload['exp'] < time()) {
                return ['error' => 'Token expired'];
            }
            
            // Get user
            $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$payload['userId']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return ['error' => 'User not found'];
            }
            
            return [
                'success' => true,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'plan' => $user['plan'],
                    'credits' => $user['credits']
                ],
                'token' => $token,
                'expiresIn' => ($payload['exp'] - time()) * 1000
            ];
        } catch (Exception $e) {
            return ['error' => 'Invalid token'];
        }
    }
    
    /**
     * Get user from token
     */
    public function getUserFromToken($token) {
        try {
            $payload = JWT::decode($token);
            
            if ($payload['exp'] < time()) {
                return null;
            }
            
            $stmt = $this->pdo->prepare("SELECT * FROM users WHERE id = ?");
            $stmt->execute([$payload['userId']]);
            return $stmt->fetch();
        } catch (Exception $e) {
            return null;
        }
    }
    
    /**
     * Save session
     */
    private function saveSession($userId, $token) {
        $expiresAt = date('Y-m-d H:i:s', time() + JWT_EXPIRY);
        $stmt = $this->pdo->prepare("
            INSERT INTO sessions (user_id, token, expires_at) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$userId, $token, $expiresAt]);
    }
    
    /**
     * Logout (invalidate token)
     */
    public function logout($token) {
        $stmt = $this->pdo->prepare("DELETE FROM sessions WHERE token = ?");
        $stmt->execute([$token]);
        return ['success' => true];
    }
}
?>
