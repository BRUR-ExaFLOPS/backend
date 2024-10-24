import { Controller, Post, Req, Res } from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node'
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('webhook')
export class WebhookController {
  private clerkClient;

  constructor(private readonly configService: ConfigService) {
    this.clerkClient =  createClerkClient({ secretKey:  this.configService.get("CLERK_SECRET_KEY")});
  }

  @Post('')
  async handleClerkWebhook(@Req() req: Request, @Res() res: Response) {
    try {
      const signature = req.headers['clerk-signature'] as string;
      const rawBody = req.body;
      // Process the webhook event
      const event = rawBody;

      if (event.type === 'user.created') {
        const user = event.data;
        // Call your service to create the user in your system
        await this.createUserInDatabase(user);
      }

      res.status(200).send({ message: 'Webhook received' });
    } catch (error) {
      console.error('Error handling Clerk webhook', error);
      res.status(400).send({ error: 'Invalid request' });
    }
  }

  async createUserInDatabase(user: any) {
    // Example: Insert the user into your database
    // const newUser = await this.userService.create({
    //   clerkUserId: user.id,
    //   email: user.email_addresses[0].email_address,
    //   firstName: user.first_name,
    //   lastName: user.last_name,
    // });

    
  }
}
