Hi everyone! My name is Bruno Messias currently I'm a Ph.D  student at USP/Brazil.  In this summer I'll develop new tools and features for FURY-GL Specifically, I'll focus into developing a system for collaborative visualization of large network layouts using FURY and VTK.

<h2>What did I do this week?</h2>




https://user-images.githubusercontent.com/6979335/122758275-fbf05800-d26e-11eb-9bd6-cf9bea2711ca.mp4



<ul>
  <li>
    <a href="https://github.com/fury-gl/fury/pull/422/commits/8a0012b66b95987bafdb71367a64897b25c89368">
      PR fury-gl/fury#422 (merged):
    </a>Integrated the 3d impostor spheres with the marker actor
  </li>
  <li>
    <a href="https://github.com/fury-gl/fury/pull/422">
      PR fury-gl/fury#422 (merged):
    </a>Fixed some issues with my maker PR which now it's merged on fury
  </li>
  <li>
    <a href="https://github.com/fury-gl/fury/pull/432">
      PR fury-gl/fury#432
    </a>I've made some improvements in my PR which can be used to fine tunning the opengl state on VTK
  </li>

<li>
  <a href="https://github.com/fury-gl/fury/pull/437">
    PR fury-gl/fury#437
  </a>
  Memory managment improvements in my Stadia-like streamer for FURY. Now, we can 
    use that streamer direct on jupyter whithout blocking
  </li>
  
  <li>
  <a href="https://github.com/fury-gl/helios/pull/1">
    PR fury-gl/helios#1
  </a>
     First version of network layout for fury it's now working well 
    and can be easily integrated with the streamer system
  </li>
</ul>
<h2>Did I get stuck anywhere?</h2>
<h3>A python-core issue</h3>

Unfortunelly, I saw a bug in the shared memory implementation

The <a href='https://docs.python.org/3/library/multiprocessing.shared_memory.html'>SharedMemory</a>from python>=3.8 offers new a way to share memory resource between unrelated process. One of the advantages of using the SharedMemory instead of the RawArray, Array from multiprocessing it’s that the SharedMemory allows to share memory blocks without those processes be related with a fork or spawm method. This it’s essential to achieve our jupyter integration, without using sockets, and to have a more simple solution than the examples presented at .. .... Unfortunately, I saw a bug in the shared memory implementation.

Let’s see the following scenario:

Let's see the following scenario
```
1-Process A creates a shared memory X
2-Process A creates a subprocess B using popen (shell=False)
3-Process B reads X
4-Process B closes X
5-Process A kills B
4-Process A closes  X
5-Process A unlink the shared memory resource X
```
The above scenario should work well. Unlink X on the process responsible to create them it's the 
correct way as discussed in the python official documentation. However, there is a open issue
which it's related with my scenario.

Fortunaley, I could use a monkey-patching solution to fix that meanwhile 
we wait to the python-core team merge and solve the issue
<a href="https://bugs.python.org/msg388287">
Let's see the following scenario</a>
<h2>What is coming up next?</h2>
