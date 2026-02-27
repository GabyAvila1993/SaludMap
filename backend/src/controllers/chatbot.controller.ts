import { Controller, Post, Body, Get, HttpException, HttpStatus } from '@nestjs/common';
import { GeminiService } from '../services/gemini.service';
import { ChatMessageDto, validateChatMessage } from '../dto/chat-message.dto';

// Nota: no incluimos el prefijo global "api" aquí; main.ts ya lo agrega.
// Dejar "api/chatbot" provocaba rutas como /api/api/chatbot y causaba 404.
@Controller('chatbot')
export class ChatbotController {
    constructor(private readonly geminiService: GeminiService) { }

    @Post('message')
    async sendMessage(@Body() body: any) {
        try {
            // Validar y transformar el mensaje usando el schema
            const chatMessage = validateChatMessage(body);
            
            // En este punto, chatMessage.message será siempre un string,
            // ya sea el mensaje original o la unión de los mensajes del array
            const message = chatMessage.message.trim();
            
            if (message === '') {
                throw new HttpException(
                    'El mensaje no puede estar vacío',
                    HttpStatus.BAD_REQUEST
                );
            }

            const response = await this.geminiService.generateResponse(message);

            return {
                success: true,
                data: {
                    userMessage: message,
                    botResponse: response,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error en sendMessage:', error);
            
            // Si es un error de validación de Zod
            if (error.issues) {
                throw new HttpException({
                    message: 'Error de validación',
                    details: error.issues
                }, HttpStatus.BAD_REQUEST);
            }
            
            throw new HttpException(
                error.message || 'Error al procesar el mensaje',
                error.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Post('feature')
    async getFeatureInfo(@Body() body: { featureId: string }) {
        try {
            const response = await this.geminiService.getFeatureInfo(body.featureId);

            return {
                success: true,
                data: {
                    featureId: body.featureId,
                    response: response,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            throw new HttpException(
                'Error al obtener información de la funcionalidad',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get('health')
    healthCheck() {
        return {
            success: true,
            message: 'Chatbot service is running',
            timestamp: new Date().toISOString(),
            version: process.env.CHATBOT_VERSION || '1.0.0'
        };
    }

    @Get('context')
    getContext() {
        return {
            success: true,
            data: {
                projectName: 'SaludMap',
                description: 'Tu Guía Sanitaria y Veterinaria',
                availableFeatures: [
                    'Mapa Interactivo',
                    'Reserva de Turnos',
                    'Modo Offline',
                    'Soporte Multilingüe',
                    'Integración con Seguros'
                ]
            }
        };
    }
    @Get('test')
    async testGemini(): Promise<string> {
        return this.geminiService.testConnection();
    }

}