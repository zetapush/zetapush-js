interface HandshakeFields {
  ext: any;
}

interface AbstractHandshakeOptions {
  authType: string;
  sandboxId: string;
  deploymentId: string;
}

interface CredentialsHandshakeOptions {
  authType: string;
  deploymentId: string;
  login: string;
  password: string;
}

interface TokenHandshakeOptions {
  authType: string;
  deploymentId: string;
  token: string;
}

interface AbstractHandshake {
  authType: string;
  authVersion: string;
  sandboxId: string;
  deploymentId: string;
  getHandshakeFields(client: Client): HandshakeFields;
}

interface CredentialsAuthData {
  login: string;
  password: string;
}

interface CredentialsHandshake extends AbstractHandshake {
  login: string;
  password: string;
  authData: CredentialsAuthData;
}

interface TokenAuthData {
  token: string;
}

interface TokenHandshake extends AbstractHandshake {
  token: string;
  authData: TokenAuthData;
}

type AuthenticationCallback = () => AbstractHandshake;

type AsyncMacroServicePublisher = (method: string, parameters: any, hardFail?: boolean, debug?: number) => Promise<any>;

type MacroServicePublisher = (method: string, parameters: any, hardFail?: boolean, debug?: number) => void;

type ServicePublisher = (method: string, parameters: any) => void;

interface Options {
  apiUrl?: string;
  sandboxId: string;
  forceHttps?: boolean;
  resource?: string;
  transports?: any[];
}

interface Service {
  DEFAULT_DEPLOYMENT_ID: string;
}

interface ServiceDeclaration {
  deploymentId?: string;
  listener?: any;
  Type: Service;
}

interface Token {
  token: string;
}

interface Credentials {
  login: string;
  password: string;
}

interface ClientHelper {
  authentication: AuthenticationCallback;
  servers: Promise<string[]>;
  getUniqRequestId(): string;
}

type ConnectionStatusHandler = number;

export interface ClientOptions extends Options {
  authentication(): AbstractHandshake;
}

export interface WeakClientOptions extends Options {
  deploymentId?: string;
}

export class Authentication {
  static delegating({ token }: TokenAuthData): TokenHandshake;
  static simple({ login, password }: CredentialsAuthData): CredentialsHandshake;
  static weak({ token }: TokenAuthData): TokenHandshake;
}

export interface ConnectionStatusListener {
  onConnectionBroken(): void;
  onConnectionClosed(): void;
  onConnectionEstablished(): void;
  onConnectionToServerFail(failure: any): void;
  onConnectionWillClose(): void;
  onFailedHandshake(failure: any): void;
  onMessageLost(): void;
  onNoServerUrlAvailable(): void;
  onSuccessfulHandshake(authentication: any): void;
}

export class Client {
  helper: ClientHelper;
  constructor(options: ClientOptions);
  addConnectionStatusListener(listener: ConnectionStatusListener): ConnectionStatusHandler;
  connect(): void;
  createService(declaration: ServiceDeclaration): Service;
  createAsyncMacroService(declaration: ServiceDeclaration): services.Macro;
  disconnect(): void;
  isConnected(): boolean;
  getSandboxId(): string;
  getResource(): string;
  getUserId(): string;
  removeConnectionStatusListener(listener: ConnectionStatusHandler): void;
  setAuthentication(authentication: AuthenticationCallback): void;
  setLogLevel(level: string): void;
  setResource(resource: string): void;
  unsubscribe(service: Service): void;
  //
  onConnectionBroken(handler: () => void): ConnectionStatusHandler;
  onConnectionClosed(handler: () => void): ConnectionStatusHandler;
  onConnectionEstablished(handler: () => void): ConnectionStatusHandler;
  onConnectionToServerFail(handler: (failure: any) => void): ConnectionStatusHandler;
  onConnectionWillClose(handler: () => void): ConnectionStatusHandler;
  onFailedHandshake(handler: (failure: any) => void): ConnectionStatusHandler;
  onMessageLost(handler: () => void): ConnectionStatusHandler;
  onNoServerUrlAvailable(handler: () => void): ConnectionStatusHandler;
  onSuccessfulHandshake(handler: (authentication: any) => void): ConnectionStatusHandler;
}

export class SmartClient extends Client {
  getCredentials(): any;
  getSession(): any;
  hasCredentials(): boolean;
  isStronglyAuthenticated(session?: any): boolean;
  isWeaklyAuthenticated(session?: any): boolean;
  setCredentials(credentials: any): void;
}

export class WeakClient extends Client {
  constructor(options: WeakClientOptions);
  getToken(): Token;
}

export namespace services {
  class Macro implements Service {
    DEFAULT_DEPLOYMENT_ID: string;
    static DEFAULT_DEPLOYMENT_ID: string;
    $publish: AsyncMacroServicePublisher;
    constructor($publish: AsyncMacroServicePublisher);
  }
}

export const VERSION: string;

export as namespace ZetaPush;
