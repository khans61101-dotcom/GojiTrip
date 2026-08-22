import { Controller, Get } from '@nestjs/common';
import { WorkflowService } from './workflow.service';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('logs')
  findAllLogs() {
    return this.workflowService.findAllLogs();
  }
}
