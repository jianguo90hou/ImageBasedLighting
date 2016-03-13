# Image-Based Lighting
An example of image-based lighting in [stack.gl](http://stack.gl).

[See it running here.](http://oparisy.github.io/ImageBasedLighting/)

Shade adapted from "OpenGL Shading Language", third edition (the Orange Book).

## Cube map generations
HDR image source: http://www.hdrv.org/Resources.php (used under the terms of the creative commons license CC BY-NC 3.0).

Here is the process used to generate the cube maps from this HDR source. Note that most "free as beer" tools are aging or unmaintened as of 2016.
 1. The original "exr" file was resized to 128x64 (Mitchell filter, with default 0.64 sharpness) and converted to "hdr" file format using [Picturenaut 3.2](http://www.hdrlabs.com/picturenaut/).
 2. Diffuse and specular lat-long maps were convoluted using [HDRShop 1.0](http://www.gamedev.net/topic/477273-hdr-shop-no-longer-available/) (Image > Panorama > Diffuse/Specular Convolution), with "1" and "50" Phong exponent respectively.
 3. "Vertical cross" cubemaps were generated from convoluted maps using HDRShop 1.0 (Image > Panorama > Panoramic Transformations).
 4. Tone mapping was performed by Picturenaut, with default values, 8 bits output; the resulting ("low dynamic range") files were saved to jpeg with a quality of 70. Note: seems like the default "bilinear" algorithm produce washed-out images; "exposure" seems easier to control.
 5. The vertical cross cubemaps to 6 images conversions was performed by ATI's [CubeMapGen](http://developer.amd.com/tools-and-sdks/archive/legacy-cpu-gpu-tools/cubemapgen/):
   1. "Load Cube Cross",
   2. "Export Image Layout: OpenGL Cube",
   3. "Edge Fixup": width=2,
   4. "Filter Cubemap",
   5. "Save CubeMap to Images"

## Images numbering
A test image from [Horde3D](http://open-projects.net/~shahn/darcs/old/Horde3D_Linux_64bit/Horde3D/Docs/_formats.html)
 was used to check ATI's CubeMapGen images numbering: `_c00` to `_c05` are hence `PX`, `NX`, `PY`, `NY`, `PZ`, `NZ`.
 