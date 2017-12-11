# Realtime-Ocean-Rendering-WebGL

![](screenshots/Capture512.PNG)

Members: Wenli Zhao, Ricky Rajani

### Overview
In this project, we implemented realistic realtime ocean wave rendering in WebGL 2.0, referencing [Realistic Real-time Rendering of Ocean Waves](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/12/rtwave.pdf) and Simulating Ocean Water (Tessendorf 2001). 

We implemented realistic waves by generating a heightfield using Fast Fourier Transformations and a realistic lighting model which includes reflection, refraction, and alpha blending. In order to have an expansive ocean render in real-time, we
implemented view-dependent geometry wave geometry that has lower detail as we move away from the center of the ocean.

We also implemented procedural terrain using perlin noise in order to provide a sense of perspective to the ocean scene.

### Milestone 1
![](screenshots/screenshot1.png)
![](screenshots/screenshot3.png)
![](screenshots/screenshot4.png)

### Milestone 2
![](screenshots/screenshot5.png)

### Milestone 3
![](screenshots/Capture.PNG)
![](screenshots/Capture3.PNG)
![](screenshots/Capture3.PNG)

### Milestone 4
![](screenshots/Capture1024.PNG)


### Credits

* [Skybox Images](http://www.custommapmakers.org/skyboxes.php)
* [Skybox tutorial](http://math.hws.edu/eck/cs424/notes2013/webgl/skybox-and-reflection/skybox.html)
