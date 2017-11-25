# Realtime-Ocean-Rendering-WebGL

Members: Wenli Zhao, Ricky Rajani

We will be implementing the paper [Realistic Real-time Rendering of Ocean Waves](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/rtwave.pdf) in WebGL. 

Overview:
In computer games and other real-time graphics applications, the ocean surface is typically modeled as a texture or bump-mapped plane with simple lighting effects, while realistic wave geometry and sophisticated lighting effects such as reflection, refraction and Fresnel effects are ignored. The paper above describes a method for implementing real-time realistic rendering of a water surface. Our goal is to implement this technique for the web.

The system is based on two key ideas. The first is Fresnel bump mapping, which is a technique for efficiently rendering per-pixel Fresnel reflection and refraction on a dynamic bump map using graphics hardware. The accurate rendering of Fresnel effects on a dynamic bump map plays a critical role in recreating the look and feel of the ocean water. The second idea is a view-dependent representation of wave geometry. This representation can realistically describe geometry of nearby waves, while efficiently handling distant waves.

### Credits

* [Skybox Images](http://www.custommapmakers.org/skyboxes.php)
* [Skybox tutorial](http://math.hws.edu/eck/cs424/notes2013/webgl/skybox-and-reflection/skybox.html)
