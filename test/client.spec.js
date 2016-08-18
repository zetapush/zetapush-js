describe('Client',  () => {
  const sandboxId = 'Y1k3xBDc'

  beforeEach(() => {
    this.client = new ZetaPush.Client({
      sandboxId
    })
  })

  it('Should correctly create a Client object', () => {
    expect(typeof this.client).toBe('object')
    expect(this.client instanceof ZetaPush.Client).toBeTruthy()
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
