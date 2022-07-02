# java 集合

## 常用集合分类

```markdown
Collection 接口的接口 对象的集合（单列集合）
├——-List 接口：元素按进入先后有序保存，可重复
│—————-├ LinkedList 接口实现类， 链表， 插入删除， 没有同步， 线程不安全
│—————-├ ArrayList 接口实现类， 数组， 随机访问， 没有同步， 线程不安全
│—————-└ Vector 接口实现类 数组， 同步， 线程安全
│ ———————-└ Stack 是Vector类的实现类
└——-Set 接口： 仅接收一次，不可重复，并做内部排序
├—————-└HashSet 使用hash表（数组）存储元素
│————————└ LinkedHashSet 链表维护元素的插入次序
└ —————-TreeSet 底层实现为二叉树，元素排好序

Map 接口 键值对的集合 （双列集合）
├———Hashtable 接口实现类， 同步， 线程安全
├———HashMap 接口实现类 ，没有同步， 线程不安全-
│—————–├ LinkedHashMap 双向链表和哈希表实现
│—————–└ WeakHashMap
├ ——–TreeMap 红黑树对所有的key进行排序
└———IdentifyHashMap
```



# Colletion接口分类

**colletion**的父类是**Iterable**,同时colletion中有很多的方法,size() contain() isEmpty()等方法,同时Colletion中有两个重要的接口**List**和**Set**这两个同样也是接口,众多集合类都是实现这两个接口,同时Colletion没有直接的实现子类.

## Colletion接口方法

下面是Colletion接口的相关方法

![Collection](https://s2.loli.net/2022/06/19/hXYiEs6PrfjAnOW.png)

### 各方法介绍

| 方法名称                          | 说明                                                         |
| --------------------------------- | ------------------------------------------------------------ |
| boolean add(E e)                  | 向集合中添加一个元素，如果集合对象被添加操作改变了，则返回 true。E 是元素的数据类型 |
| boolean addAll(Collection c)      | 向集合中添加集合 c 中的所有元素，如果集合对象被添加操作改变了，则返回 true。 |
| void clear()                      | 清除集合中的所有元素，将集合长度变为 0。                     |
| boolean contains(Object o)        | 判断集合中是否存在指定元素                                   |
| boolean containsAll(Collection c) | 判断集合中是否包含集合 c 中的所有元素                        |
| boolean isEmpty()                 | 判断集合是否为空                                             |
| Iterator<E>iterator()             | 返回一个 Iterator 对象，用于遍历集合中的元素                 |
| boolean remove(Object o)          | 从集合中删除一个指定元素，当集合中包含了一个或多个元素 o 时，该方法只删除第一个符合条件的元素，该方法将返回 true。 |
| boolean removeAll(Collection c)   | 从集合中删除所有在集合 c 中出现的元素（相当于把调用该方法的集合减去集合 c）。如果该操作改变了调用该方法的集合，则该方法返回 true。 |
| boolean retainAll(Collection c)   | 从集合中删除集合 c 里不包含的元素（相当于把调用该方法的集合变成该集合和集合 c 的交集），如果该操作改变了调用该方法的集合，则该方法返回 true。 |
| int size()                        | 返回集合中元素的个数                                         |
| Object[] toArray()                | 把集合转换为一个数组，所有的集合元素变成对应的数组元素。     |



### Iterator<E>iterator()方法详解

此方法是通过父类**Iterator**中的方法,是返回一个迭代器对象,是遍历集合中元素的一个方法,以下为**ArrayList**实现**iterator**方法源码

```java
public Iterator<E> iterator() {
    return new Itr();
}

/**
 * An optimized version of AbstractList.Itr
 */
private class Itr implements Iterator<E> {
    int cursor;       // index of next element to return
    int lastRet = -1; // index of last element returned; -1 if no such
    int expectedModCount = modCount;

    // prevent creating a synthetic constructor
    Itr() {}

    public boolean hasNext() {
        return cursor != size;
    }

    @SuppressWarnings("unchecked")
    public E next() {
        checkForComodification();
        int i = cursor;
        if (i >= size)
            throw new NoSuchElementException();
        Object[] elementData = ArrayList.this.elementData;
        if (i >= elementData.length)
            throw new ConcurrentModificationException();
        cursor = i + 1;
        return (E) elementData[lastRet = i];
    }
```

通过阅读**ArrayList**实现**iterator**方法的源码可以发现, **ArrayList**是通过一个内部类实现**Iterator**接口,并且内部类的实现方法,是有一个**hasNext()**方法,此方法是对集合是否还有下一个元素进行判断,并且有一个next方法,是进入下一个元素,并且返回当前元素,所以可以根据迭代器查看元素,代码如下

```java
public static void main(String[] args) {
    List<Book> list = new ArrayList<>();
    list.add(new Book("张三",100));
    list.add(new Book("李四",99));
    Iterator<Book> iterator = list.iterator();
    while (iterator.hasNext()){
        System.out.println(iterator.next());
    }
}
```



### for(String a:Lists)增强for

本身也是一个迭代器



# Colletion子接口List

首先**List**接口是一个有序集合,

[List集合常用方法](https://blog.csdn.net/weixin_44789861/article/details/97016123)





# ArrayList分析

## 介绍

ArrayList维护了一个Object[]属性的数组`transient Object[] elementData`用来存放数据,并且ArrayList有两个构造函数一个是`ArrayList(int)`指定了List的大小,另一个是`ArrayList()`,并且ArrayList有扩容机制,

如果使用的是第一个构造函数,那么如果加入数据后容量不够就会扩容,扩容大小为int的1.5倍

如果使用的是第二个构造函数,那么初始的大小为0,第一次扩容为10,以后都为1.5倍



## 源码分析(走ArrayList的无参构造器)

> [!Tip]
>
> idea的dubug 显示的数据是简化后的,所以可能不会显示elementData中为null的数据
>
> 需要做如下设置
>
> ![image-20220619165902077](https://s2.loli.net/2022/06/19/qZDM8YUBwFJohXt.png)

debug的代码

```java
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ArrayList list = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            list.add(i);
        }
        for (int i = 10; i < 15; i++) {
            list.add(i);
        }
        list.add(15);
        list.add(null);
        System.out.println(list.size());
    }
}
```



1.ArrayList list = new ArrayList<>();

可以看出初始化的时候elementData为空,即{}

```java
//首先进入:可以看出给数组elementData一个初始化的值
public ArrayList() {
    this.elementData = DEFAULTCAPACITY_EMPTY_ELEMENTDATA;
}

//查看DEFAULTCAPACITY_EMPTY_ELEMENTDATA,可以看到这个值为{}
private static final Object[] DEFAULTCAPACITY_EMPTY_ELEMENTDATA = {};
```

2.list.add(i);

> [!Tip]
>
> 当我们使用迭代器或 foreach 遍历时，如果你在 foreach 遍历时，自动调用迭代器的迭代方法，此时在遍历过程中调用了集合的add,remove方法时，modCount就会改变，而迭代器记录的modCount是开始迭代之前的，如果两个不一致，就会报异常，说明有两个线路（线程）同时操作集合。这种操作有风险，为了保证结果的正确性， 避免这样的情况发生，一旦发现modCount与expectedModCount不一致，立即报错。

```java
//首先进入: 可以看出首先为进行一个装箱的操作, 即调用Integer的valueof()将int类型变为Integer类型
@IntrinsicCandidate
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}

//然后再执行add方法,modCount用于记录操作的数量, size为elementData的大小
    public boolean add(E e) {
        modCount++;
        add(e, elementData, size);
        return true;
    }

//然后进入,函数会首先比较传入的elementData包含的大小和实际数据部分长度size是否相等,这个时候进入这个函数就说明需要进行扩容了,如果相等就进行扩容,然后执行赋值操作
    private void add(E e, Object[] elementData, int s) {
        if (s == elementData.length)
            elementData = grow();
        elementData[s] = e;
        size = s + 1;
    }

//进入grow()函数,执行size+1操作,第一次size+1=1
    private Object[] grow() {
        return grow(size + 1);
    }

//进入grow()函数:old=0,然后进行判断如果是第一次扩容,则会让elementData数组的大小变为10
    private Object[] grow(int minCapacity) {
        int oldCapacity = elementData.length;
        if (oldCapacity > 0 || elementData != DEFAULTCAPACITY_EMPTY_ELEMENTDATA) {
            int newCapacity = ArraysSupport.newLength(oldCapacity,
                    minCapacity - oldCapacity, /* minimum growth */
                    oldCapacity >> 1           /* preferred growth */);
            return elementData = Arrays.copyOf(elementData, newCapacity);
        } else {
            return elementData = new Object[Math.max(DEFAULT_CAPACITY, minCapacity)];
        }
    }

//如果是第二次扩容,会进入上述函数的第一个判断中,则会进入到下面的函数中,这个时候就会扩容1.5倍
    public static int newLength(int oldLength, int minGrowth, int prefGrowth) {
        // preconditions not checked because of inlining
        // assert oldLength >= 0
        // assert minGrowth > 0

        int prefLength = oldLength + Math.max(minGrowth, prefGrowth); // might overflow
        if (0 < prefLength && prefLength <= SOFT_MAX_ARRAY_LENGTH) {
            return prefLength;
        } else {
            // put code cold in a separate method
            return hugeLength(oldLength, minGrowth);
        }
    }
```



## 源码分析(走ArrayList的有参构造器)

源码部分修改,使用有参构造器

```java
ArrayList list = new ArrayList<>(8);
```



1.走有参构造器

```java
//对参数合理化判断,然后直接创建一个大小为init的初始化数组
public ArrayList(int initialCapacity) {
    if (initialCapacity > 0) {
        this.elementData = new Object[initialCapacity];
    } else if (initialCapacity == 0) {
        this.elementData = EMPTY_ELEMENTDATA;
    } else {
        throw new IllegalArgumentException("Illegal Capacity: "+
                                           initialCapacity);
    }
}
```

2.走的其他方法和无参的时候一样

只是第一次经过判断直接扩容1.5倍





# LinkedList分析

## 介绍

LinkList内部是通过双向链表存储数据,所以据的添加和删除较ArrayList优,因为ArrayList在添加数据的时候可能会发生扩容以及对对象的复制,而链表不用,但是对于元素的查询,ArrayList要优于LinkedList,因为ArrayList使用数组,只需要下标就可以获取数据,而LinkedList则需要链表依次寻找

但是链表本身每一个元素会占用较大的资源,而ArrayList扩容会存储多个为null的数据

## 源码分析(add方法)

```java
public class Main {
    public static void main(String[] args) {
        LinkedList<Object> list = new LinkedList<>();

        list.add(1);

        System.out.println(list);
    }
}
```



1.LinkedList<Object> list = new LinkedList<>();

```java
//第一步直接调用无参构造函数
public LinkedList() {
}
```

会生成空数据{}

![image-20220620110018975](https://s2.loli.net/2022/06/20/5rtKnMHE4zJCXYj.png)

2.执行add()方法

```java
//第一步会先进行装箱操作
@IntrinsicCandidate
public static Integer valueOf(int i) {
    if (i >= IntegerCache.low && i <= IntegerCache.high)
        return IntegerCache.cache[i + (-IntegerCache.low)];
    return new Integer(i);
}

//执行添加方法
    public boolean add(E e) {
        linkLast(e);
        return true;
    }

//使用传入的数据e作为data生成一个新的节点,并且new Node内部将l当做自己的前节点,并且让last指向新的节点,如果last为null,则让first指向新节点,如果last不为null,当前节点的last就指向新节点
//第一次add: first和last和l都指向新节点,即第一个节点
//第二次add: first指向第一个节点,last指向新生成的节点,因为l不为null且为第一个节点,创建新节点的时候就将当前节点指向l即第一个节点,故第一个节点和第二个节点构成连接双向
    void linkLast(E e) {
        final Node<E> l = last;
        final Node<E> newNode = new Node<>(l, e, null);
        last = newNode;
        if (l == null)
            first = newNode;
        else
            l.next = newNode;
        size++;
        modCount++;
    }

//new Node()内部结构
        Node(Node<E> prev, E element, Node<E> next) {
            this.item = element;
            this.next = next;
            this.prev = prev;
        }
```

## 源码分析(remove方法:删除第一个元素)

源码

```java
public class Main {
    public static void main(String[] args) {
        LinkedList<Object> list = new LinkedList<>();

        list.add(1);
        list.add(2);
        list.remove();
        System.out.println(list);
    }
}
```


1.进入remove方法

```java
//指向removeFirst方法,删除第一个元素
public E remove() {
    return removeFirst();
}

//进入removeFirst方法,查看第一个元素是否为null
  public E removeFirst() {
        final Node<E> f = first;
        if (f == null)
            throw new NoSuchElementException();
        return unlinkFirst(f);
    }

//真正指向删除方法
    private E unlinkFirst(Node<E> f) {
        // assert f == first && f != null;
        final E element = f.item;//取出第一个元素数据
        final Node<E> next = f.next;//next指向第二个节点
        f.item = null;
        f.next = null; // help GC, 让第一个节点为null
        first = next;//让first指向第二个节点
        if (next == null)//如果第二个节点为null,即只有一个元素
            last = null;
        else//如果第二个节点不为null,那么就将第二个节点的prev变为null
            next.prev = null;
        size--;
        modCount++;
        return element;
    }
```



# Colletion子接口Set

Set是一个无序去重的集合



# HashSet分析

## 1.介绍

**hashSet**内部相当于是一个**hashMap**结构,即相当于是一个一维的数组,数组的每一位上存储的是一个Node链表结构数据

- 对于**hashSet**的扩容:第一次添加扩容是16位,但是16×0.75=12是一个临界值,如果达到这个临界值,就会扩容16×2=32,临界值就为32×0.75=24,依次类推,同时这个是否达到临界值,是看node节点个数
- 红黑树,如果一行的链表超过8位,并且总的超过64位,就是构建红黑树,如果表的长度超过64位,这回扩增数组
- 添加元素来说,会根据提供的数的hash算法来生成索引,所以位置并不确定,并且如果传入的数hash生成的数相同,则会比较同位置的数,用**equals**方法,如果相同,则放弃添加,否则,添加到末尾



## 2.源码分析

源码

```java
public class Main {
    public static void main(String[] args) {
        Set set = new HashSet<>();

        set.add("Java");
        set.add("Web");
        set.add("Java");
        set.add(null);
        set.add(null);

        System.out.println(set);
    }
}
```



1,debug分析

```java
//可以看出hashSet实际上是一个HashMap结构
public HashSet() {
    map = new HashMap<>();
}

//进入add方法,实际上调用了hashmap.put方法,PRESENT其实是一个static的new Object[]起到占位作用
    public boolean add(E e) {
        return map.put(e, PRESENT)==null;
    }

//进入put方法, 求出key的hash
    public V put(K key, V value) {
        return putVal(hash(key), key, value, false, true);
    }

//hash函数的内部为,可以看出如果我们传入的是null,那么索引值一直为0
    static final int hash(Object key) {
        int h;
        return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
    }

//主要的方法
    final V putVal(int hash, K key, V value, boolean onlyIfAbsent,
                   boolean evict) {
        Node<K,V>[] tab; Node<K,V> p; int n, i;
        //table为Node[]数组,那么第一次就为null 那么执行下面的方法
        //查看resize(),其中有一个下面的语句,表示创建了一个16大小的newTab,那么现在的tab就是一个大小为16的Node[]
        //Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];
        if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        //tab[i-(n-1)&hash]就是计算存入的数据在数组中的位置,如果位置上没有元素,那么就直接添加上
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
        //如果添加的元素重复,就会进入else
        else {
            Node<K,V> e; K k;
            //p指向的是Node[]某一个元素的首节点 
            //hash和equals
            //两个对象hash相同,对象也可能不同,可能发生hash碰撞
            //如果两个对象hash相同,并且如果是基本属性,只能使用==方法比较内容相同,则是同一份数据
            //如果两个对象hash相同,并且使用equals,那么是同一个对象
            //那么就不添加数据
            if (p.hash == hash &&
                ((k = p.key) == key || (key != null && key.equals(k))))
                e = p;
            else if (p instanceof TreeNode)
            //如果p是一个红黑树结构存储的,那么就使用红黑树的方法进行添加
                e = ((TreeNode<K,V>)p).putTreeVal(this, tab, hash, key, value);
            else {
            //因为Node[]的一个元素存储的是一个链表,所以对链表进行循环
                for (int binCount = 0; ; ++binCount) {
                    //如果没有找到相同元素,就创建一个新的节点
                    //并且如果链表长度>=7,创建红黑树,并且进入函数后还会进行判断
                    //if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
         //   resize();
                    //如果数组长度小于64,会进行扩容,也就是说不会进行创建红黑树的操作
                    if ((e = p.next) == null) {
                        p.next = newNode(hash, key, value, null);
                        if (binCount >= TREEIFY_THRESHOLD - 1) // -1 for 1st
                            treeifyBin(tab, hash);
                        break;
                    }
                    //如果元素相同,就直接跳出
                    if (e.hash == hash &&
                        ((k = e.key) == key || (key != null && key.equals(k))))
                        break;
                    //并且把节点加入到链表结尾
                    p = e;
                }
            }
            if (e != null) { // existing mapping for key
                V oldValue = e.value;
                if (!onlyIfAbsent || oldValue == null)
                    e.value = value;
                afterNodeAccess(e);
                return oldValue;
            }
        }
        ++modCount;
        if (++size > threshold)
            resize();
        afterNodeInsertion(evict);
        return null;
    }
```