"""
Validation script for PyMastery problems 31–47.
Run this to verify all solution_code functions pass their test cases.
"""

errors = []

def check(name, fn, *args, expected=None):
    try:
        result = fn(*args)
        if result != expected:
            errors.append(f"FAIL {name}: got {result!r}, expected {expected!r}")
        else:
            print(f"OK   {name}")
    except Exception as e:
        errors.append(f"ERROR {name}: {e}")

# ---- 31: apply_twice ----
def apply_twice(f, x): return f(f(x))
check("31a", apply_twice, lambda n: n+3, 7, expected=13)
check("31b", apply_twice, lambda n: n*2, 5, expected=20)
check("31c", apply_twice, lambda s: s+'!', 'hi', expected='hi!!')
check("31d", apply_twice, lambda n: n-1, 10, expected=8)

# ---- 32: is_palindrome ----
def is_palindrome(s):
    cleaned = [ch.lower() for ch in s if ch.isalnum()]
    return cleaned == cleaned[::-1]
check("32a", is_palindrome, "racecar", expected=True)
check("32b", is_palindrome, "hello", expected=False)
check("32c", is_palindrome, "A man a plan a canal Panama", expected=True)
check("32d", is_palindrome, "Was it a car or a cat I saw?", expected=True)
check("32e", is_palindrome, "", expected=True)
check("32f", is_palindrome, "No 'x' in Nixon", expected=True)

# ---- 33: flatten ----
def flatten(nested):
    result = []
    for item in nested:
        if isinstance(item, list): result.extend(item)
        else: result.append(item)
    return result
check("33a", flatten, [1, [2, 3], 4, [5]], expected=[1, 2, 3, 4, 5])
check("33b", flatten, [[1, 2], [3, 4]], expected=[1, 2, 3, 4])
check("33c", flatten, [1, 2, 3], expected=[1, 2, 3])
check("33d", flatten, [], expected=[])
check("33e", flatten, [[]], expected=[])

# ---- 34: counter closure ----
def make_counter():
    count = [0]
    def counter():
        count[0] += 1
        return count[0]
    return counter
def test_counter_calls(n):
    counter = make_counter()
    return [counter() for _ in range(n)]
check("34a", test_counter_calls, 3, expected=[1, 2, 3])
check("34b", test_counter_calls, 1, expected=[1])
check("34c", test_counter_calls, 5, expected=[1, 2, 3, 4, 5])
check("34d", test_counter_calls, 0, expected=[])
# independence check
c1 = make_counter(); c2 = make_counter()
c1(); c1()
assert c2() == 1, "counters not independent!"
print("OK   34_independence")

# ---- 35: count_up_to ----
def count_up_to(limit):
    result = []; current = 1
    while current <= limit:
        result.append(current); current += 1
    return result
check("35a", count_up_to, 5, expected=[1, 2, 3, 4, 5])
check("35b", count_up_to, 1, expected=[1])
check("35c", count_up_to, 0, expected=[])
check("35d", count_up_to, -3, expected=[])

# ---- 36: make_multiplier ----
def make_multiplier(factor):
    def multiply(x): return x * factor
    return multiply
def test_multiplier(factor, x): return make_multiplier(factor)(x)
check("36a", test_multiplier, 3, 5, expected=15)
check("36b", test_multiplier, 2, 10, expected=20)
check("36c", test_multiplier, 1, 99, expected=99)
check("36d", test_multiplier, 0, 42, expected=0)

# ---- 37: format_greeting ----
def format_greeting(name, time_of_day):
    if time_of_day == 'morning': return f'Good morning, {name}!'
    elif time_of_day == 'afternoon': return f'Good afternoon, {name}!'
    elif time_of_day == 'evening': return f'Good evening, {name}!'
    else: return f'Hello, {name}!'
check("37a", format_greeting, 'Alice', 'morning', expected='Good morning, Alice!')
check("37b", format_greeting, 'Bob', 'afternoon', expected='Good afternoon, Bob!')
check("37c", format_greeting, 'Carol', 'evening', expected='Good evening, Carol!')
check("37d", format_greeting, 'Dave', 'night', expected='Hello, Dave!')

# ---- 38: calculate ----
def calculate(a, op, b):
    if op == '+': return float(a + b)
    elif op == '-': return float(a - b)
    elif op == '*': return float(a * b)
    elif op == '/':
        if b == 0: raise ZeroDivisionError('Cannot divide by zero')
        return float(a / b)
    else: raise ValueError(f'Unsupported operator: {op!r}')
check("38a", calculate, 10, '+', 5, expected=15.0)
check("38b", calculate, 10, '-', 3, expected=7.0)
check("38c", calculate, 4, '*', 2.5, expected=10.0)
check("38d", calculate, 9, '/', 3, expected=3.0)
try: calculate(1, '%', 2); errors.append("38e no ValueError raised")
except ValueError: print("OK   38e ValueError raised")
try: calculate(5, '/', 0); errors.append("38f no ZeroDivisionError raised")
except ZeroDivisionError: print("OK   38f ZeroDivisionError raised")

# ---- 39: get_initials ----
def get_initials(full_name):
    parts = full_name.strip().split()
    initials = [part[0].upper() for part in parts if part]
    return '.'.join(initials) + '.'
check("39a", get_initials, 'john doe', expected='J.D.')
check("39b", get_initials, 'mary ann smith', expected='M.A.S.')
check("39c", get_initials, 'Alice', expected='A.')
check("39d", get_initials, 'Jean-Luc Picard', expected='J.P.')
check("39e", get_initials, '  ada  lovelace  ', expected='A.L.')

# ---- 40: safe_divide ----
def safe_divide(a, b):
    if b == 0: return None
    return a / b
check("40a", safe_divide, 10, 2, expected=5.0)
check("40b", safe_divide, 7, 0, expected=None)
check("40c", safe_divide, 0, 5, expected=0.0)
check("40d", safe_divide, -9, 3, expected=-3.0)

# ---- 41: safe_get ----
def safe_get(lst, index, default=None):
    try: return lst[index]
    except IndexError: return default
check("41a", safe_get, [1,2,3], 1, expected=2)
check("41b", safe_get, [1,2,3], 5, expected=None)
check("41c", safe_get, [1,2,3], 5, -1, expected=-1)   # default=-1
# actually safe_get takes (lst, index, default) so:
check("41d", lambda: safe_get([], 0), expected=None)
check("41e", lambda: safe_get(['a','b'], -1), expected='b')
check("41f", lambda: safe_get(['a','b'], -10, 'x'), expected='x')

# ---- 42: parse_numbers ----
def parse_numbers(strings):
    result = []
    for s in strings:
        try: result.append(float(s))
        except (ValueError, TypeError): pass
    return result
check("42a", parse_numbers, ['1','2.5','abc','3'], expected=[1.0, 2.5, 3.0])
check("42b", parse_numbers, ['hello','world'], expected=[])
check("42c", parse_numbers, ['10','-3','0','nope'], expected=[10.0, -3.0, 0.0])
check("42d", parse_numbers, [], expected=[])

# ---- 43: word_count_map ----
def word_count_map(text):
    counts = {}
    for raw_word in text.split():
        word = ''.join(ch for ch in raw_word if ch.isalpha()).lower()
        if word: counts[word] = counts.get(word, 0) + 1
    filtered = {w: c for w, c in counts.items() if c > 1}
    return dict(sorted(filtered.items(), key=lambda item: item[1], reverse=True))
check("43a", word_count_map, "the cat sat on the mat the cat", expected={'the': 3, 'cat': 2})
check("43b", word_count_map, "hello world", expected={})
check("43c", word_count_map, "Go go GO stop go", expected={'go': 4})

# ---- 44: top_n_scorers ----
def top_n_scorers(scores, n):
    if not scores or n == 0: return []
    sorted_players = sorted(scores.keys(), key=lambda name: (-scores[name], name))
    return sorted_players[:n]
check("44a", top_n_scorers, {'Alice':50,'Bob':80,'Carol':70}, 2, expected=['Bob','Carol'])
check("44b", top_n_scorers, {'Alice':50,'Bob':50,'Carol':70}, 2, expected=['Carol','Alice'])
check("44c", top_n_scorers, {}, 3, expected=[])
check("44d", top_n_scorers, {'Alice':100,'Bob':90,'Carol':80}, 0, expected=[])
check("44e", top_n_scorers, {'Zara':60,'Anna':60,'Mike':60}, 2, expected=['Anna','Mike'])

# ---- 45: two_sum_indices ----
def two_sum_indices(nums, target):
    seen = {}
    for j in range(len(nums)):
        complement = target - nums[j]
        if complement in seen:
            return [seen[complement], j]
        if nums[j] not in seen:
            seen[nums[j]] = j
    return []
check("45a", two_sum_indices, [2,7,11,15], 9, expected=[0,1])
check("45b", two_sum_indices, [3,2,4], 6, expected=[1,2])
check("45c", two_sum_indices, [1,2,3,4], 5, expected=[0,3])
check("45d", two_sum_indices, [1,2,3], 100, expected=[])
check("45e", two_sum_indices, [5,5], 10, expected=[0,1])
check("45f", two_sum_indices, [], 5, expected=[])

# ---- 46: are_anagrams ----
def are_anagrams(s1, s2):
    clean1 = s1.replace(' ','').lower()
    clean2 = s2.replace(' ','').lower()
    if len(clean1) != len(clean2): return False
    counts = {}
    for ch in clean1: counts[ch] = counts.get(ch, 0) + 1
    for ch in clean2: counts[ch] = counts.get(ch, 0) - 1
    return all(v == 0 for v in counts.values())
check("46a", are_anagrams, 'listen', 'silent', expected=True)
check("46b", are_anagrams, 'Hello', 'world', expected=False)
check("46c", are_anagrams, 'Astronomer', 'Moon starer', expected=True)
check("46d", are_anagrams, 'abc', 'ab', expected=False)
check("46e", are_anagrams, '', '', expected=True)
check("46f", are_anagrams, 'Dormitory', 'Dirty room', expected=True)

# ---- 47: roman_to_int ----
def roman_to_int(s):
    values = {'I':1,'V':5,'X':10,'L':50,'C':100,'D':500,'M':1000}
    total = 0; prev = 0
    for ch in reversed(s):
        curr = values[ch]
        if curr < prev: total -= curr
        else: total += curr
        prev = curr
    return total
check("47a", roman_to_int, 'III', expected=3)
check("47b", roman_to_int, 'IV', expected=4)
check("47c", roman_to_int, 'IX', expected=9)
check("47d", roman_to_int, 'LVIII', expected=58)
check("47e", roman_to_int, 'MCMXCIV', expected=1994)
check("47f", roman_to_int, 'XLII', expected=42)
check("47g", roman_to_int, 'MMXXVI', expected=2026)
check("47h", roman_to_int, 'CD', expected=400)

print()
if errors:
    print("FAILURES:")
    for e in errors: print(" ", e)
else:
    print("ALL 17 SOLUTIONS PASS ✓")
