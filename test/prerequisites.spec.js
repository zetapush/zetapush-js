describe('Prerequisites', function () {
  it('Should have Promise global function', function () {
    expect(typeof Promise).toBe('function')
  })
  it('Should have fetch global function', function () {
    expect(typeof fetch).toBe('function')
  })
})
