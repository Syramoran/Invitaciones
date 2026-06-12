// src/modules/templates/templates.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto, UpdateTemplateDto, TemplateQueryDto, TemplateResponseDto, TemplatePublicDto } from './dto/template.dto';
import { Public } from '../auth/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Templates')
@Controller('templates')
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  // ─────────────────────────────────────────
  // Endpoints públicos (sin JWT)
  // ─────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar templates (público)' })
  @ApiResponse({ status: 200, description: 'Lista de templates' })
  findAll(@Query() query: TemplateQueryDto) : Promise<TemplateResponseDto[]> {
    return this.templatesService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un template por ID (público)' })
  @ApiResponse({ status: 200, description: 'Detalle del template' })
  findOne(@Param('id', ParseIntPipe) id: number) : Promise<TemplateResponseDto> {
    return this.templatesService.findById(id);
  }

  @Public()
  @Get(':id/preview')
  @ApiOperation({ summary: 'Vista previa de un template (público)' })
  @ApiResponse({ status: 200, description: 'Detalle básico del template' })
  preview(@Param('id', ParseIntPipe) id: number) : Promise<TemplatePublicDto> {
    return this.templatesService.findPreview(id);
  }

  // ─────────────────────────────────────────
  // Endpoints admin (protegidos por JwtAuthGuard global)
  // ─────────────────────────────────────────

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear template (admin)' })
  @ApiResponse({ status: 201, description: 'Template creado' })
  create(@Body() dto: CreateTemplateDto) {
    return this.templatesService.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Actualizar template (admin)' })
  @ApiResponse({ status: 200, description: 'Template actualizado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTemplateDto,
  ) {
    return this.templatesService.update(id, dto);
  }

  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Activar/desactivar template (admin)' })
  @ApiResponse({ status: 200, description: 'Estado actualizado' })
  toggle(@Param('id', ParseIntPipe) id: number) {
    return this.templatesService.toggle(id);
  }
}