export interface ConnectionOptions {
  sandboxId: string;
}

export class Connection {
  private sandboxId: string;
  constructor(options: ConnectionOptions) {
    this.sandboxId = options.sandboxId;
  }
  connect() {}
  onSuccessfulHandshake() {}
  getSandboxId() {
    return this.sandboxId;
  }
}
