import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ChatbotService } from '../../services/chatbot.service';
import { Subscription } from 'rxjs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent implements OnInit, OnDestroy {
  isOpen = false;
  messages: Message[] = [];
  userInput = '';
  isLoading = false;
  private sub?: Subscription;

  constructor(private http: HttpClient, private chatbotService: ChatbotService) {
    // Add welcome message
    this.messages.push({
      role: 'assistant',
      content: "Hi! I'm GourmAI 🍽️ I can help you find the perfect restaurant or dish. What are you craving?"
    });
  }

  ngOnInit(): void {
    this.sub = this.chatbotService.isOpen$.subscribe(v => this.isOpen = v);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  toggleChat(): void { this.chatbotService.toggle(); }

  closeChat(): void { this.chatbotService.close(); }

  sendMessage(): void {
    if (!this.userInput.trim() || this.isLoading) return;

    const userMessage = this.userInput.trim();
    
    // Add user message to chat
    this.messages.push({
      role: 'user',
      content: userMessage
    });

    this.userInput = '';
    this.isLoading = true;

    // Send to backend
    const conversationHistory = this.messages.map(m => ({
      role: m.role === 'user' ? 'User' : 'Assistant',
      content: m.content
    }));

    this.http.post<{ message: string }>(`${environment.serverUrl}/chat`, {
      message: userMessage,
      conversationHistory: conversationHistory.slice(0, -1) // exclude the message we just added
    }).subscribe({
      next: (response) => {
        this.messages.push({
          role: 'assistant',
          content: response.message
        });
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Chat error:', err);
        this.messages.push({
          role: 'assistant',
          content: "Sorry, I'm having trouble right now. Please try again!"
        });
        this.isLoading = false;
      }
    });
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
