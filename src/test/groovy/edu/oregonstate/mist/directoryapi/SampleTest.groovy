package edu.oregonstate.mist.directoryapi

import edu.oregonstate.mist.directoryapi.core.Sample
import org.junit.Test
import static org.junit.Assert.*

class SampleTest {
    @Test
    public void testSample() {
        assertTrue(new Sample().message == 'hello world')
    }
}
