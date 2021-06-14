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
</p><pre><code>
  ./ngrok http 8000  
 </code>
</pre>
  <p></p>
<br>
<h2>How it works?</h2>
<p>
The image bellow it's a simple representation of the streaming system. 
</p>
<img alt="" src="https://user-images.githubusercontent.com/6979335/121934889-33ff1480-cd1e-11eb-89a4-562fbb953ba4.png">
<p>
As you can see, the streaming system is made up of different processes that share some memory blocks with each other.
One of the hardest part of this PR was to code this sharing between different objects like VTK, numpy and the webserver.
  I'll discuss next some of technical issues that I had to learn/circunvent.
</p>


<h3>Sharing data between process</h3>

We want to avoiding any kind unnecessary duplication of data or 
expensive copy/write actions. We can achieve this economy of computational 
resources using the multiprocessing module from python. 
<h4>multiprocessing RawArray </h4>
<p>
The 
  <a href="https://docs.python.org/3/library/multiprocessing.html#multiprocessing.sharedctypes.RawArray">
    RawArray
  </a>
  from multiprocessing allows to share resources between different process. However,the are 
some tricks to get a better performance when we are dealing with RawArray's. 
For example, 
<a href="https://github.com/devmessias/fury/tree/6ae82fd239dbde6a577f9cccaa001275dcb58229">
 take a look in my PR in a older stage.
  </a> 
  
  In this older stage my streaming system was working well. However, one of my mentors (Filipi Nascimento)
  saw a huge latency for high-resolutions examples. My first thought was 
  that latency was caused by the GPU-CPU copy from the opengl context. However, I discovered that 
  I've been using RawArray's wrong in my entire life!
  <br>
 
  See for example this line of code
  <a href="https://github.com/devmessias/fury/blob/6ae82fd239dbde6a577f9cccaa001275dcb58229/fury/stream/client.py#L101">
  fury/stream/client.py#L101
</a>
The code bellow shows how I've been updating the raw arrays
  </p>
  
<pre><code>
raw_arr_buffer[:] = new_data
</code>
</pre>

<p>This works fine for small and medium sized arrays, but for large takes a large amount of time, more than GPU-CPU copy.
  The explanation for this bad performance it's available here : 
  <a href="https://stackoverflow.com/questions/33853543/demystifying-sharedctypes-performance">
  Demystifying sharedctypes performance.
  </a>
 The solution which gives a stupendous performance improvement is quite simple. RawArrays implements the buffer
  protocol. Therefore, we just to need the use the memoryview:
  
  </p>
  
<pre><code>
memview(arr_buffer)[:] = new_data
</code>
</pre>

<p>
  The memview it's  realy good, but there it's a litte issue  when we are dealing with uint8
  RawArrays.  The following 
  code will cause an exception
  </p>

<pre><code>
memview(arr_buffer_uint8)[:] = new_data_uint8
</code>
</pre>
<p>
 There is a solution  for uint8 rawarrays using just memview and cast methods. However, 
   numpy comes to rescue and offers a simple and a more a generic 
  solution. You just need to convert the rawarray to a np representation in the following way
 </p>
<pre><code>
arr_uint8_repr = np.ctypeslib.as_array(arr_buffer_uint8)
arr_uint8_repr[:] = new_data_uint8
</code>
</pre>
<p>
  You can navigate to my repository in this specific
  <a href="https://github.com/devmessias/fury/commit/b1b0caf30db762cc018fc99dd4e77ba0390b2f9e">
  commit position
  </a> and test the streaming examples 
  to see how this little modification improves the performance.
  </p>
<h3>The issues with with different Operating Systems</h3>
Serge Koudoro, which is one of my mentors, have pointed an issue of the streaming system running in MacOs.
I don't know many things about MacOs, and as pointed by Filipi the way that MacOs deals with multiprocessing 
it's very different than the Linux approach. Altough we solved the issue discoverd by Serge, I need to be more carrefuly 
to assume that different operating system will behave in the same way. If you want to know more, I recommend you 
to read this post
<a href="https://britishgeologicalsurvey.github.io/science/python-forking-vs-spawn/">Python: Forking vs Spawm</a>.
And it's also important to read the official documentation from python. It can save you 
a lot of time. 

Take a look what the official python documentation says about the multiprocessing method

<img src='https://user-images.githubusercontent.com/6979335/121958121-b0ebb780-cd39-11eb-862a-37244f7f635b.png'/>
<small>Source: <a href='https://docs.python.org/3/library/multiprocessing.html'>https://docs.python.org/3/library/multiprocessing.html</a>
