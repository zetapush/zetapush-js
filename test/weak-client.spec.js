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
      this.client.onConnectionEstablished(() => {
        expect(this.client.isConnected()).toBeTruthy()
        done()
      })
      this.client.connect()
    })
  })
  describe('WeakClient deconnection',  () => {
    it('Should connect and disconnect', (done) => {
      this.client.onConnectionEstablished(() => {
        expect(this.client.isConnected()).toBeTruthy()
        this.client.onConnectionClosed(() => {
          expect(this.client.isConnected()).toBeFalsy()
          done()
        })
        this.client.disconnect()
      })
      this.client.connect()
    })
  })
})
