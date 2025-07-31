<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Email</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-text {
            font-size: 18px;
            margin-bottom: 24px;
            color: #2c3e50;
        }
        
        .instruction {
            font-size: 16px;
            margin-bottom: 32px;
            color: #5a6c7d;
            line-height: 1.7;
        }
        
        .confirm-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 0 auto;
            display: block;
            max-width: 280px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .confirm-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }
        
        .alternative-link {
            margin-top: 32px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .alternative-link p {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 8px;
        }
        
        .alternative-link a {
            color: #667eea;
            word-break: break-all;
            font-size: 13px;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            font-size: 14px;
            color: #6c757d;
            margin-bottom: 8px;
        }
        
        .security-note {
            margin-top: 24px;
            padding: 16px;
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            font-size: 14px;
            color: #856404;
        }
        
        /* Mobile responsiveness */
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .header, .content, .footer {
                padding-left: 20px;
                padding-right: 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .confirm-button {
                padding: 14px 24px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>Welcome!</h1>
            <p>We're excited to have you on board</p>
        </div>
        
        <div class="content">
            <p class="welcome-text">Hello there! 👋</p>
            
            <p class="instruction">
                Thank you for signing up! To complete your registration and start using your account, 
                please confirm your email address by clicking the button below.
            </p>
            
            <a href="{{ .ConfirmationURL }}" class="confirm-button">
                Confirm Email Address
            </a>
            
            <div class="alternative-link">
                <p><strong>Having trouble with the button?</strong></p>
                <p>Copy and paste this link into your browser:</p>
                <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .TokenType }}">{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .TokenType }}</a>
            </div>
            
            <div class="security-note">
                <strong>🔒 Security Note:</strong> This confirmation link will expire in 24 hours. 
                If you didn't create an account, you can safely ignore this email.
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Need help?</strong></p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <p style="margin-top: 16px; font-size: 12px; color: #9ca3af;">
                This email was sent from an automated system. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
