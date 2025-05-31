describe('Basic Test', () => {
  test('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  test('should handle string operations', () => {
    const message = 'Hello World';
    expect(message.toLowerCase()).toBe('hello world');
  });
});