const nodemailer = require("nodemailer");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendPasswordMail(to, email, password, fullName) {
    try {
      await this.transporter.sendMail({
        from: `"TestFlow" <${process.env.SMTP_USER}>`,
        to,
        subject: "Добро пожаловать в TestFlow! Ваши данные для входа",
        text: `Здравствуйте, ${fullName}! Ваш логин: ${email}, Ваш пароль: ${password}`,
        html: `
                    <div style="background-color: #f4f7f6; padding: 40px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
                        
                        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.08);">
                        
                            <div style="background-color: #f8c50d; padding: 30px 40px; text-align: center;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 28px; letter-spacing: 1px;">TestFlow</h1>
                            </div>
                            
                            <div style="padding: 40px;">
                                <h2 style="margin-top: 0; color: #1e293b; font-size: 22px;">Здравствуйте, ${fullName}!</h2>
                                
                                <p style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 25px;">
                                    Администратор успешно создал для вас профиль в системе тестирования. Теперь вы можете войти в свой личный кабинет и приступить к назначенным заданиям.
                                </p>

                                <div style="background-color: #f8fafc; border-left: 4px solid #f8c50d; padding: 20px 25px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                                    <p style="margin: 0 0 12px 0; font-size: 16px; color: #0f172a;">
                                        <span style="color: #64748b; font-size: 14px; display: block; margin-bottom: 4px;">Ваш логин (email):</span>
                                        <strong>${email}</strong>
                                    </p>
                                    <p style="margin: 0; font-size: 16px; color: #0f172a;">
                                        <span style="color: #64748b; font-size: 14px; display: block; margin-bottom: 4px;">Ваш временный пароль:</span>
                                        <strong>${password}</strong>
                                    </p>
                                </div>

                                <p style="color: #475569; line-height: 1.6; font-size: 16px; margin-bottom: 30px; text-align: center;">
                                    Нажмите на кнопку ниже, чтобы перейти на страницу авторизации:
                                </p>

                                <div style="text-align: center;">
                                    <a href="${process.env.CLIENT_URL}/login" 
                                       style="display: inline-block; background-color: #f8c50d; color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: 0.5px;">
                                       Перейти в личный кабинет
                                    </a>
                                </div>
                            </div>
                            
                            <div style="background-color: #f8fafc; padding: 25px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
                                <p style="margin: 0; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                                    В целях безопасности рекомендуем изменить пароль после первого входа в систему.<br><br>
                                    Если вы получили это письмо по ошибке, просто проигнорируйте его.
                                </p>
                            </div>

                        </div>
                        
                        <div style="max-width: 600px; margin: 20px auto 0; text-align: center;">
                            <p style="color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} TestFlow. Все права защищены.</p>
                        </div>
                    </div>
                `,
      });
    } catch (error) {
      console.error(`Ошибка при отправке письма на ${to}:`, error);
    }
  }
}

module.exports = new MailService();
