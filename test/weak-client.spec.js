describe('WeakClient',  () => {
  const sandboxId = 'Y1k3xBDc'

  beforeEach(() => {
    this.client = new ZetaPush.WeakClient({
      sandboxId
    })
  })

  describe('WeakClient initial state',  () => {
    it('Should correctly create a WeakClient object', () => {
      expect(typeof this.client).toBe('object')
      expect(this.client instanceof ZetaPush.WeakClient).toBeTruthy()
    })

    it('Should not be connected', () => {
      expect(this.client.isConnected()).toBeFalsy()
    })

    it('Should have a nul userId', () => {
      expect(this.client.getUserId()).toBeNull()
    })

    it('Should have a correct sandboxId', () => {
      expect(this.client.getSandboxId()).toBe(sandboxId)
    })
  })

  describe('WeakClient connection',  () => {
    it('Should connect', (done) => {
      const client = this.client
      client.onConnectionEstablished(() => {
        expect(client.isConnected()).toBeTruthy()
        done()
      })
      client.connect()
    })
  })

  describe('WeakClient deconnection',  () => {
    it('Should connect and disconnect', (done) => {
      const client = this.client
      client.addConnectionStatusListener({
        onConnectionEstablished() {
          expect(client.isConnected()).toBeTruthy()
          client.disconnect()
        },
        onConnectionClosed() {
          expect(client.isConnected()).toBeFalsy()
          done()
        }
      })
      client.connect()
    })
  })

  describe('WeakClient session persistence',  () => {
    it('Should keep user session between connections', (done) => {
      const client = this.client
      const sessions = []
      client.addConnectionStatusListener({
        onConnectionEstablished() {
          expect(client.isConnected()).toBeTruthy()
          if (sessions.length < 2) {
            client.disconnect()
          }
          else {
            const [ first, second ] = sessions
            expect(first.userId).toBeDefined()
            expect(second.userId).toBeDefined()
            expect(first.userId).toBe(second.userId)
            done()
          }
        },
        onConnectionClosed() {
          expect(client.isConnected()).toBeFalsy()
          if (sessions.length < 2) {
            client.connect()
          }
        },
        onSuccessfulHandshake(session) {
          sessions.push(session)
        }
      })
      client.connect()
    })
  })

})
