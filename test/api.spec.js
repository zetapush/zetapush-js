describe('Public API', function () {
  it('Should define a ZetaPush global object', function () {
    expect(typeof ZetaPush).toBe('object')
  })
  it('Should define a ZetaPush.Client class', function () {
    expect(typeof ZetaPush.Client).toBe('function')
  })
  it('Should define a ZetaPush.SmartClient class', function () {
    expect(typeof ZetaPush.SmartClient).toBe('function')
  })
  it('Should define a ZetaPush.WeakClient class', function () {
    expect(typeof ZetaPush.WeakClient).toBe('function')
  })
  it('Should define a ZetaPush.services object', function () {
    expect(typeof ZetaPush.services).toBe('object')
  })
  it('Should define a ZetaPush.Authentication class', function () {
    expect(typeof ZetaPush.Authentication).toBe('function')
  })
})
