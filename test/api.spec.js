describe('Public API', function () {
  it('Should define a ZetaPush global object', function () {
    expect(typeof ZetaPush).toBe('object')
  })
  it('Should define a ZetaPush.Client global object', function () {
    expect(typeof ZetaPush.Client).toBe('function')
  })
  it('Should define a ZetaPush.WeakClient global object', function () {
    expect(typeof ZetaPush.WeakClient).toBe('function')
  })
})
