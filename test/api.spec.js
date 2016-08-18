describe('Public API', function () {
  it('Should define a ZetaPush global object', function () {
    expect(typeof ZetaPush).toBe('object')
  })
  it('Should define a ZetaPush.Client object', function () {
    expect(typeof ZetaPush.Client).toBe('function')
  })
  it('Should define a ZetaPush.WeakClient object', function () {
    expect(typeof ZetaPush.WeakClient).toBe('function')
  })
  it('Should define a ZetaPush.services object', function () {
    expect(typeof ZetaPush.services).toBe('object')
  })
})
