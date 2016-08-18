describe('Public API', () => {
  it('Should define a ZetaPush global object', () => {
    expect(typeof ZetaPush).toBe('object')
  })
  it('Should define a ZetaPush.Client global object', () => {
    expect(typeof ZetaPush.Client).toBe('function')
  })
  it('Should define a ZetaPush.WeakClient global object', () => {
    expect(typeof ZetaPush.WeakClient).toBe('function')
  })
})
