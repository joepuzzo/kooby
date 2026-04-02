export class Tool {
  constructor({ name, description }) {
    if (!name || !description) {
      throw new Error('Tool requires both a name and description');
    }
    this.name = name;
    this.description = description;
    this.functions = {};
  }

  defineFunction({ name, description, parameters, handler }) {
    if (!name || !description || !parameters || typeof handler !== 'function') {
      throw new Error(`Invalid function definition for tool "${this.name}"`);
    }

    this.functions[name] = {
      name,
      description,
      parameters,
      handler
    };
  }

  getToolDefinitions() {
    return Object.values(this.functions).map(func => ({
      type: 'function',
      function: {
        name: this.getFunctionName(func.name),
        description: `${this.description} ${func.description}`.trim(),
        parameters: func.parameters
      }
    }));
  }

  getFunctionHandlers() {
    return Object.values(this.functions).map(func => ({
      name: this.getFunctionName(func.name),
      handler: func.handler
    }));
  }

  getFunctionName(functionName) {
    return `${this.name}_${functionName}`;
  }
}
