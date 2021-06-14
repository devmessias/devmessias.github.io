<h1> Post #1 - A Stadia-like system for data visualization </h1>
<p>
  Hi all! In this post I'll talk about the PR <a href="https://github.com/fury-gl/fury/pull/437">#437</a>.
</p>
<p>
There are several reasons to have a streaming system for data visualization. From my background of doing a PhD in a development country I always need to think in the cheapest way to use the computational resources available. For example, with the GPU’s prices increasing, it’s necessary to share a machine with a GPU with different users in different locations. Therefore, to convince my Brazilian friends to use FURY I need to code thinking inside of the low-budget scenario.
 </p>
 
 <p>
  To construct the streaming system for my project I thinking about the following properties and behaviors:
  </p>
 
 <ol>
  <li>I want to avoid blocking the code execution in the main thread (where the vtk/fury instance resides)</li>
  <li>The streaming should work inside of a low bandwidth enviroment</li>
  <li>I need a easy way to share the rendering result. For example  using the free version of ngrok</li>
  </ol>
<p>
  To achieve the property <strong>1.</strong> we need to circumvent the GIL problem. Using the threading module 
  alone it’s not good enough because we can’t use the python-threading for parallel  CPU computation. In addition,  to achieve a better organization it’s better to define the server system as an uncoupled module. Therefore, I believe that multiprocessing-lib in python will fit very well for our proposes.
</p>
<p>
  To the streaming system works smoothly in a low-bandwidth scenario we need to choose the protocol wisely. In the recent years the WebRTC protocol has been used in myriad of applications like google hangouts and Google Stadia aiming low latency behavior. Therefore, I choose the webrtc as a my first protocol to be available in the streaming system proposal.
</p>
<p>
  To achieve the third property, we must be economical in adding requirements and dependencies.
  </p>
  
  <p>
  Currently, the system has some issues, but it's already working. You can see some tutorials about how to use this 
  streaming system 
  <a href="https://github.com/devmessias/fury/tree/feature_fury_stream_client/docs/tutorials/04_stream">here</a>.
  
  After running one of this examples you can easily share the results and interaction with another users.
  
  For example, using the ngrok
  ```
  ./ngrok http 8000  
  ```
  </p>
<br>
<h2>How it works?</h2>
<p>
The image bellow it's a simple representation of the streaming system. 
</p>
<img alt="" src="https://user-images.githubusercontent.com/6979335/121934889-33ff1480-cd1e-11eb-89a4-562fbb953ba4.png">
<p>
As you can see, the streaming system it's composed by different process sharing some blocks of memories.
</p>
   
<h2>
Details, pi
</h2>

<h3>The hard part: sharing data between process</h3>

We want to avoiding any kind unecessary duplication of data or 
expensive copy/write actions. We can achieve this economy of computational 
resources using the multiprocessing module from python.
<h4>multiprocessing RawArray </h4>

<a href="https://github.com/devmessias/fury/commit/6ae82fd239dbde6a577f9cccaa001275dcb58229">
 commit too slow
  </a>
  
```python
arr_buffer[:] = new_data
```

```python
memview(arr_buffer)[:] = new_data
```

This will fail

```python
memview(arr_buffer_uint8)[:] = new_data_uint8
```
<a href="https://github.com/devmessias/fury/commit/b1b0caf30db762cc018fc99dd4e77ba0390b2f9e">
  my commit
  </a>
 numpy comes to rescue
 
```python
arr_uint8_repr = np.ctypeslib.as_array(arr_buffer_uint8)
arr_uint8_repr[:] = new_data_uint8
```
<h5>The issues with forking with different Operating Systems</h5>

<h4>Python 3.8 shared_memory and jupyter/vscode integration</h4>
