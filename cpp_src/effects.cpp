#include <emscripten.h>

extern "C" {
  EMSCRIPTEN_KEEPALIVE
  void grayscale(unsigned char* data, int width, int height) {
    // Each pixel is 4 bytes (R, G, B, A).
    for (int i = 0; i < width * height * 4; i += 4) {
      // Use the 'average' method for grayscale.
      int gray = (data[i] + data[i+1] + data[i+2]) / 3;
      data[i] = gray;     // Red
      data[i+1] = gray;   // Green
      data[i+2] = gray;   // Blue
      // data[i+3] is the Alpha channel, which we leave unchanged.
    }
  }

  EMSCRIPTEN_KEEPALIVE
  void sepia(unsigned char* data, int width, int height) {
    for (int i = 0; i < width * height * 4; i += 4) {
      int r = data[i];
      int g = data[i+1];
      int b = data[i+2];

      int tr = (int)(0.393 * r + 0.769 * g + 0.189 * b);
      int tg = (int)(0.349 * r + 0.686 * g + 0.168 * b);
      int tb = (int)(0.272 * r + 0.534 * g + 0.131 * b);

      // Clamp values to 255
      data[i] = (tr > 255) ? 255 : tr;
      data[i+1] = (tg > 255) ? 255 : tg;
      data[i+2] = (tb > 255) ? 255 : tb;
    }
  }
}