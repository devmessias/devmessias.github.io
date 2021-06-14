
<h1> A stadia-like system for data visualization </h1>
<p>
  Hi all! In this post I'll talk about my PR...and the reasons for this PR.
</p>
<p>


 </p>
 <ul>
  <li>reduce the bandwidth consumption</li>
  <li>sharing the results with my colaborators in a easy and cheap way, for example using the free version of ngrok</li>
  </ul>
<p>
 
</p>
<br>
<img alt=""
     src="https://user-images.githubusercontent.com/6979335/121920659-a36d0800-cd0e-11eb-83a1-6a093efed03e.png"/>

   
<h2>
Solution
</h2>

<h3>The hard part: sharing data between process</h3>

<h4>multiprocessing RawArray </h4>
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
 numpy comes to rescue
```python
arr_uint8_repr = np.ctypeslib.as_array(arr_buffer_uint8)
arr_uint8_repr[:] = new_data_uint8
```
<h4>Python 3.8 shared_memory</h4>
