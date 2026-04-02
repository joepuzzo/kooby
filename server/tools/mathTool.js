import { Tool } from './tool.js';

export class MathTool extends Tool {
  constructor() {
    super({
      name: 'math',
      description: 'Perform simple arithmetic operations.'
    });

    this.defineFunction({
      name: 'add',
      description: 'Add two numbers together.',
      parameters: {
        type: 'object',
        properties: {
          a: {
            type: 'number',
            description: 'The first number to add.'
          },
          b: {
            type: 'number',
            description: 'The second number to add.'
          }
        },
        required: ['a', 'b']
      },
      handler: ({ a, b }) => ({ result: Number(a) + Number(b) })
    });

    this.defineFunction({
      name: 'subtract',
      description: 'Subtract the second number from the first.',
      parameters: {
        type: 'object',
        properties: {
          a: {
            type: 'number',
            description: 'The number to subtract from.'
          },
          b: {
            type: 'number',
            description: 'The number to subtract.'
          }
        },
        required: ['a', 'b']
      },
      handler: ({ a, b }) => ({ result: Number(a) - Number(b) })
    });
  }
}
