<p>Hi everyone! My name is Bruno Messias and I'm a PhD student working with graphs and networks. This summer I'll develop new tools and features for FURY-GL Specifically, I'll focus on developing a system for collaborative visualization of large network layouts using FURY and VTK.</p>

<p>In these two past weeks I’ve spent most of my time in the 
<a href=’https://github.com/fury-gl/fury/pull/437/’>Streaming System PR</a>
and the 
<a href=’https://github.com/fury-gl/helios/pull/1/’>Network Layout PR</a>
 In this post I’ll focus in the most relevant things I’ve made for those PRs</p>
<h2>Streaming System</h2>
<p><strong>Pull request  <a href=’https://github.com/fury-gl/fury/pull/437/’> fury-gl/fury/pull/437</a></strong></p>



<h3>Code Refactoring, abstract class and SOLID</h3>
<p>
The past weeks I spent some time refactoring the code. To see what I’ve done let’ s take a look into this 
<a
href=“https://github.com/devmessias/fury/blob/b1e985bd6a0088acb4a116684577c4733395c9b3/fury/stream/client.py#L20”>fury/blob/b1e985bd6a0088acb4a116684577c4733395c9b3/fury/stream/client.py#L20</a>, the FuryStreamClient Object before the refactoring.
</p>
<p>
The code is a mess.
To see why this code it’s not good according with SOLID principles let’s just list all the responsibilities of FuryStreamClient
<ul>
<li>Creates a RawArray or SharedMemory for store the n-buffers</li>
<li>Creates a RawArray or SharedMemory to store the informations about each buffer</li>
<li>Cleanup the shared memory resources if SharedMemory was used</li>
<li>Writes the vtk buffer into a property n-buffer</li>
<li>Creates the vtk callbacks to update the vtk-buffer</li>
</ul>
<p>
That’s a lot and those responsibilities are not even related to each other. How can we be more SOLID[1]? An obvious solution it’s to create a specific object to deal with the shared memory resources. But this it’s not good enough  because we still have a poor generalization due that this new object still needs to deal with different memory management systems: rawarray or shared memory (maybe sockets in the future). Fortunately, we can use the python Abstract Classes[2] to organize the code.</p>
<p>To use the ABC from python I first  listed all the behaviors that should be mandatory in the new abstract class. If we are using SharedMemory or RawArrays I need first create the memory resource in a proper way. Therefore, the GenericImageBufferManager must have a abstractmetod create_mem_resource. If we take into the ImageBufferManager inside of stream/server/server.py sometimes it’s necessary to load the memory resource in a proper way. Because  of that GenericImageBufferManager needs to have a create a load_mem_resource.  Finally, each type of ImageBufferManager should have a different cleanup method because of that we add a cleanup abstract method. </p>

<pre>
<code>

from abc import ABC, abstractmethod

GenericImageBufferManager(ABC):
    def __init__(
            self, max_window_size=None, num_buffers=2, use_shared_mem=False):
	…
 	#...

    @abstractmethod
    def load_mem_resource(self):
        pass

    @abstractmethod
    def create_mem_resource(self):
        pass

    @abstractmethod
    def cleanup(self):
        Pass

</code>
</pre>
<p>
Now we can look for those behaviors inside of FuryStreamClient.py and ImageBufferManger.py that does not depend if we are using the SharedMemory or RawArrays.  These behaviors should be methods inside of the new GenericImageBufferManager.
</p>
<code>
<pre>

class GenericImageBufferManager(ABC):
    def __init__(
            self, max_window_size=None, num_buffers=2, use_shared_mem=False)
        self.max_window_size = max_window_size
        self.num_buffers = num_buffers
        self.info_buffer_size = num_buffers*2 + 2
        self._use_shared_mem = use_shared_mem
        self.max_size = None  # int
        self.num_components = 3
        self.image_reprs = []
        self.image_buffers = []
        self.image_buffer_names = []
        self.info_buffer_name = None
        self.info_buffer = None
        self.info_buffer_repr = None
        self._created = False

    @property
    def next_buffer_index(self):
        index = int((self.info_buffer_repr[1]+1) % self.num_buffers)
        return index

    @property
    def buffer_index(self):
        index = int(self.info_buffer_repr[1])
        return index

    def write_into(self, w, h, np_arr):
        buffer_size = buffer_size = int(h*w)
        next_buffer_index = self.next_buffer_index
        if buffer_size == self.max_size:
            self.image_reprs[
                next_buffer_index][:] = np_arr
        elif buffer_size < self.max_size:
            self.image_reprs[
                    next_buffer_index][0:buffer_size*3] = np_arr
        else:
            rand_img = np.random.randint(
                0, 255, size=self.max_size*3,
                dtype='uint8')

            self.image_reprs[
                next_buffer_index][:] = rand_img

            w = self.max_window_size[0]
            h = self.max_window_size[1]

        self.info_buffer_repr[2+next_buffer_index*2] = w
        self.info_buffer_repr[2+next_buffer_index*2+1] = h
        self.info_buffer_repr[1] = next_buffer_index

    def get_current_frame(self):
        if not self._use_shared_mem:
            image_info = np.frombuffer(
                    self.info_buffer, 'uint32')
        else:
            image_info = self.info_buffer_repr

        buffer_index = int(image_info[1])

        self.width = int(image_info[2+buffer_index*2])
        self.height = int(image_info[2+buffer_index*2+1])

        self.image_buffer_repr = self.image_reprs[buffer_index]

        return self.width, self.height, self.image_buffer_repr

    def get_jpeg(self):
        width, height, image = self.get_current_frame()

        if self._use_shared_mem:
            image = np.frombuffer(
                image, 'uint8')

        image = image[0:width*height*3].reshape(
                (height, width, 3))
        image = np.flipud(image)
        # preserve width and height, flip B->R
        image = image[:, :, ::-1]
        if OPENCV_AVAILABLE:
            image_encoded = cv2.imencode('.jpg', image)[1]
        else:
            image_encoded = Image.fromarray(image)

        return image_encoded.tobytes()

    async def async_get_jpeg(self, ms=33):
        jpeg = self.get_jpeg()
        await asyncio.sleep(ms/1000)
        return jpeg

    @abstractmethod
    def load_mem_resource(self):
        pass

    @abstractmethod
    def create_mem_resource(self):
        pass

    @abstractmethod
    def cleanup(self):
        Pass
</code>
</pre>
<p>

With the GenericImageBufferManager the 
<a href=’https://github.com/devmessias/fury/blob/440a39d427822096679ba384c7d1d9a362dab061/fury/stream/tools.py#L609>
RawArrayImageBufferManager</a>
and <a href=’https://github.com/devmessias/fury/blob/440a39d427822096679ba384c7d1d9a362dab061/fury/stream/tools.py#L681>SharedMemImageBufferManager</a> it’s now implemented without duplicated code (DRY principle). This makes the code more readable and easy to find bugs. In addition, later we can implement other memory management systems in the streaming system without modifying the behavior of FuryStreamClient or the code inside of server.py.
</p>

<p>
 I’ve also applied the same SOLID principles to improve the CircularQueue object. Although the CircularQueue and FuryStreamInteraction was not violating the S from SOLID the head-tail buffer  from the CircularQueue must have a way to lock the write/read if the memory resource is busy. Meanwhile the multiprocessing.Arrays already have a context which allows lock (.get_lock()) SharedMemory dosen’t[2]. Using abstract class allowed me to deal with those peculiarities.
 </p>

<h3>Testing</h3>

<p>My mentors asked to me to write tests for this PR. Therefore, during the past week I’ve implemented the most important tests for the streaming system:
<a href=’https://github.com/devmessias/fury/blob/440a39d427822096679ba384c7d1d9a362dab061/fury/tests/test_stream.py’>/fury/tests/test_stream.py</a>

<h3>Most relevant bugs</h3>
 

As I’ve discussed in my <a href=’https://blogs.python-gsoc.org/en/demvessiass-blog/weekly-check-in-3-15/’>third week</a> check-in there is a open issue related with SharedMemory in python. This “bug” happens in the streaming system through the following scenario

<pre>
<code>
1-Process A creates a shared memory X
2-Process A creates a subprocess B using popen (shell=False)
3-Process B reads X
4-Process B closes X
5-Process A kills B
4-Process A closes  X
5-Process A unlink() the shared memory resource 
</pre>
</code>
In python, this scenario translates to 
<pre>
<code>
from multiprocessing import shared_memory as sh
import time
import subprocess
import sys

shm_a = sh.SharedMemory(create=True, size=10000)
command_string = f"from multiprocessing import shared_memory as sh;import time;shm_b = sh.SharedMemory('{shm_a.name}');shm_b.close();"
time.sleep(2)
p = subprocess.Popen(
    [sys.executable, '-c', command_string],
    stdout=subprocess.PIPE, stderr=subprocess.PIPE, shell=False)
p.wait()
print("\nSTDOUT")
print("=======\n")
print(p.stdout.read())
print("\nSTDERR")
print("=======\n")
print(p.stderr.read())
print("========\n")
time.sleep(2)
shm_a.close()
shm_a.unlink()
</code>
</pre>

Fortunately, I could use a monkey-patching[3] solution to fix that meanwhile we wait to the python-core team to fix the resource_tracker (38119) issue [4].


<h2>Network Layout (Helios-FURY)</h2>


<p><strong>Pull request  <a href=’https://github.com/fury-gl/helios/pull/1/’> fury-gl/helios/pull/1</a></strong></p>

<p>Finally, the first version of FURY network layout it’s working as can you seen in the video bellow</p> 

<iframe height="315" src="https://www.youtube.com/embed/aN1mUPRHoqM" width="560"></iframe>

<p>In addition, this already can be used with the streaming system allowing user interactions across the internet with WebRTC protocol.</p>


<p>One of the issues that I had to solve to achieve the result presented in the above video was to find a way to update the positions of the vtk objects without blocking the main thread and at same time allowing the vtk events calls. My solution was to define a interval timer using the python threading module. </p>
<h2>Refs:</h2>

<ul>
<li>[1] A. Souly, “5 Principles to write SOLID Code (examples in Python),” Medium, Apr. 26, 2021. https://towardsdatascience.com/5-principles-to-write-solid-code-examples-in-python-9062272e6bdc (accessed Jun. 28, 2021).</li>

<li>[2] “[Python-ideas] Re: How to prevent shared memory from being corrupted ?” https://www.mail-archive.com/python-ideas@python.org/msg22935.html (accessed Jun. 28, 2021).</li>

<li>[3]“Message 388287 - Python tracker.” https://bugs.python.org/msg388287 (accessed Jun. 28, 2021).
</li>
<li>[4]“bpo-38119: Fix shmem resource tracking by vinay0410 · Pull Request #21516 · python/cpython,” GitHub. https://github.com/python/cpython/pull/21516 (accessed Jun. 28, 2021).
</li>
</ul>
