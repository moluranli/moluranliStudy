## 1. Java的值传递

- java中都是值传递,没有引用传递
- java的参数如果是基础类型,那么会创建一个**基础类型的副本**,无论怎么改变副本的值,原值都不会改变
- java的参数如果是引用类型,传递的就是**地址的副本**,因为是指向的同一个地址,所以如果值改变,那么原值也会发生改变



## 2. Java的序列号与反序列化

**序列号**就是将数据结构或者是对象转变为二进制的形式

**反序列化**相反



### 2.1 Java序列化的应用场景

1. **网络传输**,比如Socket传输过程中要对数据进行转换
2. 将对象存储到**文件**中和从文件中读取对象
3. 将对象存储到**缓存数据库**比如**Redis**当中,和从Redis中取出对象



### 2.2 Java序列化方式

详见: [序列化方式](https://javaguide.cn/java/basis/serialization.html#jdk-%E8%87%AA%E5%B8%A6%E7%9A%84%E5%BA%8F%E5%88%97%E5%8C%96%E6%96%B9%E5%BC%8F)



## 3. Java的反射机制

### 3.1 反射机制的应用场景(业务场景中很少用到)

1. **JDK实现动态代理**,使用了反射类**Method**
2. **Java注解**,基于反射分析类,获取类上的注解



### 3.2 获取Class对象的四种方法

详见:[获取 Class 对象的四种方式](https://javaguide.cn/java/basis/reflection.html#%E8%8E%B7%E5%8F%96-class-%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%9B%9B%E7%A7%8D%E6%96%B9%E5%BC%8F)

1. 直接通过Stu.class获取
2. 通过Class.forName("路径")
3. 通过stu.getClass()
4. 通过类加载器ClassLoader.loadClass("类路径")



### 3.3 反射的基本操作

[反射的基本操作](https://javaguide.cn/java/basis/reflection.html#%E5%8F%8D%E5%B0%84%E7%9A%84%E4%B8%80%E4%BA%9B%E5%9F%BA%E6%9C%AC%E6%93%8D%E4%BD%9C)



## 常见的IO操作

IO操作实际上是调用了系统的操作,因为用户本身并没有权限来访问内核空间,所以实现IO操作实际上是

1. 内核等待IO设备准备
2. 内核将数据从内核拷贝到用户



