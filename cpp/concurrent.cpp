#include <string>
#include <thread>
#include <vector>
#include <iostream>
using namespace std;

int main() {
	string str;
	thread t1([&](){ str += "Hello "; });
	thread t2([&](){ str += "world!"; });
	t1.join();
	t2.join();
	cout << str;
}